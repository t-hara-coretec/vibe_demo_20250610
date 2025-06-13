// app.js - frontend for audio upload, polling, and UI
document.getElementById('audioForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('mp3File');
    const progress = document.getElementById('progress');
    const resultText = document.getElementById('resultText');
    const errorMsg = document.getElementById('errorMsg');
    const downloadLink = document.getElementById('downloadLink');

    resultText.classList.add('hidden');
    errorMsg.classList.add('hidden');
    downloadLink.classList.add('hidden');
    progress.classList.remove('hidden');
    progress.textContent = "Processing...";

    if (!fileInput.files[0]) {
        errorMsg.textContent = 'Please select an MP3 file to upload.';
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        return;
    }

    const formData = new FormData();
    console.log(fileInput.files[0])
    formData.append('file', fileInput.files[0]);

    let job_id = null;
    try {
        console.log("hello")
        const res = await fetch('http://192.168.10.114:8000/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload file.');
        const data = await res.json();
        job_id = data.job_id;
    } catch (e) {
        console.log(e.message)
        errorMsg.textContent = e.message + "hoge";
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        return;
    }
    console.log("hello_2")

    // Polling for status
    let status = 'processing';
    let pollCount = 0;
    while (status === 'processing' && pollCount < 600) { // Poll up to 60 times (about 1 min)
        await new Promise(r => setTimeout(r, 1000));
        const sres = await fetch(`http://192.168.10.114:8000/status/${job_id}`);
        if (!sres.ok) break;
        const sdata = await sres.json();
        status = sdata.status;
        pollCount += 1;
    }

    if (status !== 'done') {
        errorMsg.textContent = 'Transcription failed or timed out.';
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        return;
    }

    // Fetch transcript
    const tres = await fetch(`http://192.168.10.114:8000/download/${job_id}`);
    if (!tres.ok) {
        errorMsg.textContent = 'Failed to download transcript.';
        errorMsg.classList.remove('hidden');
        progress.classList.add('hidden');
        return;
    }
    const transcript = await tres.text();
    resultText.value = transcript;
    resultText.classList.remove('hidden');

    // Setup download
    const blob = new Blob([transcript], {type: 'text/plain'});
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.classList.remove('hidden');
    progress.classList.add('hidden');
});
