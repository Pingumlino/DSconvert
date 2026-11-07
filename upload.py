from flask import Flask, request, jsonify, send_from_directory
import os
import uuid
from werkzeug.utils import secure_filename

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ============================================
# CONFIGURAÇÕES
# ============================================

UPLOAD_FOLDER = 'sounds'
ALLOWED_EXTENSIONS = {'mp3'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 5MB
BASE_URL = 'https://Pingumlino.pythonanywhere.com'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ============================================
# FUNÇÕES AUXILIARES
# ============================================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============================================
# ROTAS
# ============================================

@app.route('/')
def index():
    return open('index.html', 'r', encoding='utf-8').read()

@app.route('/style.css')
def style():
    return open('style.css', 'r', encoding='utf-8').read()

@app.route('/script.js')
def script():
    return open('script.js', 'r', encoding='utf-8').read()

@app.route('/upload', methods=['POST'])
def upload():
    try:
        # Verifica se tem arquivo
        if 'audio' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['audio']

        if file.filename == '':
            return jsonify({'error': 'Arquivo vazio'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos MP3 são permitidos'}), 400

        # Verifica tamanho
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)

        if size > MAX_FILE_SIZE:
            return jsonify({'error': f'Arquivo muito grande. Máximo: {MAX_FILE_SIZE // (1024*1024)}MB'}), 400

        # Gera nome único
        original_name = secure_filename(file.filename)
        name_without_ext = os.path.splitext(original_name)[0]
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{name_without_ext}_{unique_id}.mp3"

        # Salva o arquivo
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Gera o link
        link = f"{BASE_URL}/sounds/{filename}"

        return jsonify({
            'success': True,
            'link': link,
            'filename': filename,
            'size': size
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sounds/<filename>')
def serve_sound(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ============================================
# RODA O SERVIDOR
# ============================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)