// app.js - frontend for audio upload, polling, summarizing, and UI

function setButtonsDisabled(disabled) {
    document.querySelectorAll('.app-button').forEach(btn => {
        btn.disabled = disabled;
        if (disabled) {
            btn.classList.add('button-disabled');
        } else {
            btn.classList.remove('button-disabled');
        }
    });
    // file input
    const fileInput = document.getElementById('mp3File');
    if (fileInput) fileInput.disabled = disabled;
}

document.getElementById('audioForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('mp3File');
    const progress = document.getElementById('progress');
    const resultText = document.getElementById('resultText');
    const errorMsg = document.getElementById('errorMsg');
    const downloadLink = document.getElementById('downloadLink');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryText = document.getElementById('summaryText');

    errorMsg.classList.add('hidden');
    downloadLink.classList.add('hidden');
    progress.classList.remove('hidden');
    progress.textContent = "Processing...";
    resultText.value = '';
    summaryText.value = '';
    resultText.readOnly = true;
    summaryText.readOnly = true;
    summarizeBtn.disabled = true;
    // setButtonsDisabled(true); // <-- Move this after validation

    if (!fileInput.files[0]) {
        showErrorModal('変換したいMP3ファイルを選択してください');
        progress.classList.add('hidden');
        setButtonsDisabled(false); // re-enable UI if invalid
        return;
    }

    setButtonsDisabled(true); // now truly start disabling

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    let job_id = null;
    try {
        const res = await fetch('http://192.168.10.55:8000/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('アップロードに失敗しました');
        const data = await res.json();
        job_id = data.job_id;
    } catch (e) {
        errorMsg.textContent = e.message;
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        setButtonsDisabled(false);
        return;
    }

    // Polling for status
    let status = 'processing';
    let pollCount = 0;
    while (status === 'processing' && pollCount < 600) { // Poll up to 60 times (about 1 min)
        await new Promise(r => setTimeout(r, 1000));
        const sres = await fetch(`http://192.168.10.55:8000/status/${job_id}`);
        if (!sres.ok) break;
        const sdata = await sres.json();
        status = sdata.status;
        if (status == "done") break;
        pollCount += 1;
    }

    if (status !== 'done') {
        errorMsg.textContent = '変換失敗：タイムアウト';
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        setButtonsDisabled(false);
        return;
    }

    // Fetch transcript
    const tres = await fetch(`http://192.168.10.55:8000/download/${job_id}`);
    if (!tres.ok) {
        errorMsg.textContent = 'ダウンロード失敗';
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        setButtonsDisabled(false);
        return;
    }
    const transcript = await tres.text();
    resultText.value = transcript;
    resultText.readOnly = false;
    summarizeBtn.disabled = false; // Enable summarize when transcript is ready

    // Setup download
    const blob = new Blob([transcript], {type: 'text/plain'});
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.classList.remove('hidden');
    progress.classList.add('hidden');
    summarizeBtn.classList.remove('hidden'); // Show the Summarize button now.
    setButtonsDisabled(false);
});

// --- Modal for Summarize Error ---
function showErrorModal(message) {
    document.getElementById('errorModalMsg').textContent = message;
    document.getElementById('errorModal').classList.remove('hidden');
}
function hideErrorModal() {
    document.getElementById('errorModal').classList.add('hidden');
}
document.getElementById('closeErrorModal').onclick = hideErrorModal;

document.getElementById('summarizeBtn').addEventListener('click', async function() {
    const resultText = document.getElementById('resultText');
    const transcript = resultText.value;
    const progress = document.getElementById('progress');
    const errorMsg = document.getElementById('errorMsg');
    const summaryText = document.getElementById('summaryText');

    errorMsg.classList.add('hidden');

    // Guard: Prevent summarize if no converted text
    if (!transcript.trim()) {
        showErrorModal('先に認識を行ってください');
        progress.classList.add('hidden');
        return;
    }

    progress.classList.remove('hidden');
    progress.textContent = "Summarizing...";
    setButtonsDisabled(true);

    try {
        const res = await fetch('http://192.168.10.55:8000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: transcript })
        });
        if (!res.ok) throw new Error('要約生成失敗');
        const data = await res.json();
        summaryText.value = data.summary;
        summaryText.readOnly = false;

        // Download summary link setup
        const downloadSummaryLink = document.getElementById('downloadSummaryLink');
        const summaryBlob = new Blob([data.summary], { type: 'text/plain' });
        downloadSummaryLink.href = URL.createObjectURL(summaryBlob);
        downloadSummaryLink.classList.remove('hidden');

    } catch (e) {
        errorMsg.textContent = e.message;
        errorMsg.classList.remove('hidden');
    }
    progress.classList.add('hidden');
    setButtonsDisabled(false);
});
