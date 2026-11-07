// ============================================
// DOM ELEMENTOS
// ============================================

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultArea = document.getElementById('resultArea');
const loadingArea = document.getElementById('loadingArea');
const audioLink = document.getElementById('audioLink');

// ============================================
// EVENTOS
// ============================================

// Clique no upload area abre o seletor de arquivo
uploadArea.addEventListener('click', () => fileInput.click());
uploadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        uploadFile(files[0]);
    }
});

// Seleção de arquivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
});

// ============================================
// FUNÇÕES
// ============================================

async function uploadFile(file) {
    // Validação: é MP3?
    if (!file.name.toLowerCase().endsWith('.mp3')) {
        alert('❌ Apenas arquivos MP3 são permitidos!');
        return;
    }

    // Validação: tamanho (5MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Arquivo muito grande! Máximo de 10MB.');
        return;
    }

    // Mostra loading
    uploadArea.style.display = 'none';
    loadingArea.style.display = 'block';
    resultArea.style.display = 'none';

    // Prepara o form
    const formData = new FormData();
    formData.append('audio', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Mostra resultado
            loadingArea.style.display = 'none';
            resultArea.style.display = 'block';
            audioLink.value = data.link;
        } else {
            alert(`❌ Erro: ${data.error}`);
            resetUpload();
        }
    } catch (error) {
        alert(`❌ Erro ao enviar: ${error.message}`);
        resetUpload();
    }
}

function copyLink() {
    audioLink.select();
    audioLink.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(audioLink.value);
    
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

function resetUpload() {
    uploadArea.style.display = 'flex';
    loadingArea.style.display = 'none';
    resultArea.style.display = 'none';
    fileInput.value = '';
}