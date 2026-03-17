"""
Upload Routes
POST /api/upload – Accept multiple code files, run analysis, store result
"""

import os
import json
import uuid

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from models.db import db, Analysis
from plagiarism_detector import PlagiarismDetector

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {
    "py", "java", "js", "ts", "c", "cpp", "cs",
    "rb", "go", "php", "swift", "kt", "rs",
    "r", "txt", "html", "css"
}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def infer_language(filenames):
    ext_map = {
        "py": "Python", "java": "Java", "js": "JavaScript",
        "ts": "TypeScript", "c": "C", "cpp": "C++",
        "cs": "C#", "rb": "Ruby", "go": "Go",
        "php": "PHP", "swift": "Swift", "kt": "Kotlin", "rs": "Rust"
    }

    for name in filenames:
        ext = name.rsplit(".", 1)[-1].lower()
        if ext in ext_map:
            return ext_map[ext]

    return "Unknown"


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_files():
    try:
        # 🔍 DEBUG (very important)
        print("JWT IDENTITY:", get_jwt_identity())
        print("FILES:", request.files)
        print("FORM:", request.form)

        # ✅ FIX: consistent with auth_routes (string → int)
        try:
            user_id = int(get_jwt_identity())
        except Exception:
            return jsonify({
                "error": "Invalid user identity in token"
            }), 422

        # ✅ VALIDATION
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded"}), 400

        files = request.files.getlist("files")

        if len(files) < 2:
            return jsonify({"error": "Upload at least two files"}), 400

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")

        session_id = str(uuid.uuid4())
        session_dir = os.path.join(upload_folder, session_id)
        os.makedirs(session_dir, exist_ok=True)

        code_files = {}
        file_names = []

        for file in files:
            if not file or file.filename == "":
                continue

            if not allowed_file(file.filename):
                return jsonify({
                    "error": f"File type not allowed: {file.filename}"
                }), 400

            filename = secure_filename(file.filename)
            file_path = os.path.join(session_dir, filename)

            file.save(file_path)

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    code = f.read()
            except Exception:
                return jsonify({
                    "error": f"Could not read file: {filename}"
                }), 400

            code_files[filename] = code
            file_names.append(filename)

        if len(code_files) < 2:
            return jsonify({
                "error": "At least two valid files required"
            }), 400

        # ✅ Language detection
        language = request.form.get("language") or infer_language(file_names)

        # ✅ Run analysis
        detector = PlagiarismDetector(language=language)
        result = detector.analyze(code_files)

        if not result or "error" in result:
            return jsonify({
                "error": "Analysis failed",
                "details": result.get("error") if result else "Unknown error"
            }), 400

        # ✅ Save to DB
        analysis = Analysis(
            user_id=user_id,
            file_names=json.dumps(file_names),
            similarity_score=result.get("overall_score", 0),
            algorithm="cosine+jaccard",
            language=language,
            result_json=json.dumps(result)
        )

        db.session.add(analysis)
        db.session.commit()

        result["analysis_id"] = analysis.analysis_id
        result["language"] = language

        return jsonify({
            "message": "Analysis completed successfully",
            "result": result
        }), 200

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        return jsonify({
            "error": "Server error during analysis",
            "details": str(e)
        }), 500
