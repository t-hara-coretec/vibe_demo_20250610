# Speech-to-Text Web Application

## Overview
This project is a web application designed for converting MP3 audio files into text using OpenAI's Whisper API. It features a robust backend powered by FastAPI and a user-friendly frontend styled with Tailwind CSS, providing an intuitive interface for users to upload, process, and download transcribed text.

## Features
- **Speech-to-Text Conversion**: Upload MP3 files and convert them to text using OpenAI's Whisper API.
- **File Handling**: Supports MP3 files of any size by splitting files larger than 25MB into smaller segments to comply with Whisper API's file size limits.
- **Downloadable Output**: Provides the converted text as a downloadable file.
- **File Management**: Automatically deletes uploaded MP3 files after processing to ensure efficient storage use.
- **User Interface**:
  - Displays a progress indicator dialog during file processing.
  - Shows an error dialog if issues occur during conversion.
  - Presents converted text in a text area for easy viewing.
  - Styled with Tailwind CSS for a modern, responsive design.

## Tech Stack
- **Backend**: FastAPI for efficient and scalable API development.
- **Frontend**: HTML, JavaScript, and Tailwind CSS for a responsive and visually appealing interface.
- **Speech-to-Text**: OpenAI Whisper API for accurate audio transcription.
- **File Processing**: Custom logic to handle MP3 splitting and compatibility with API limits.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/speech-to-text-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd speech-to-text-app
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install frontend dependencies (if applicable):
   ```bash
   npm install
   ```
5. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your OpenAI API key:
     ```env
     OPENAI_API_KEY=your-api-key
     ```
6. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
7. Access the application at `http://localhost:8000`.

## Usage
1. Open the web application in your browser.
2. Upload an MP3 file using the provided interface.
3. View the progress indicator as the file is processed.
4. Check the text area for the transcribed text or download it as a file.
5. If an error occurs, an error dialog will display relevant information.

## File Handling
- **MP3 Size Limit**: Files larger than 25MB are automatically split into smaller segments to ensure compatibility with the Whisper API.
- **Post-Processing**: Uploaded MP3 files are deleted from the server after conversion to optimize storage.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact
For questions or feedback, please reach out at [your-email@example.com](mailto:your-email@example.com).