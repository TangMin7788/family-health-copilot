# Medical Image Analysis Feature

## Overview

This feature allows users to upload medical images (X-rays, CT scans, MRIs, etc.) and get AI-powered analysis using the MedGemma model.

## Architecture

### Backend Components

1. **Image Analyzer Service** ([`backend/app/services/image_analyzer.py`](backend/app/services/image_analyzer.py))
   - Wraps the MedGemma model for image-to-text analysis
   - Uses the `transformers` pipeline for "image-text-to-text" tasks
   - Loaded once at startup via the singleton `ModelService`

2. **Model Service Update** ([`backend/app/services/model_service.py`](backend/app/services/model_service.py))
   - Added `_image_analyzer` instance
   - Loads the image analyzer during startup
   - Provides `analyze_image()` method for API endpoints

3. **API Endpoint** ([`backend/app/api/v1/models.py`](backend/app/api/v1/models.py))
   - POST `/api/v1/models/analyze-image`
   - Accepts: image file (multipart/form-data), optional prompt, optional max_tokens
   - Returns: analysis text and processing time

4. **Request/Response Schemas** ([`backend/app/models/schemas.py`](backend/app/models/schemas.py))
   - `ImageAnalysisRequest`: Validates input parameters
   - `ImageAnalysisResponse`: Structures the API response

### Frontend Components

1. **API Client** ([`frontend/src/lib/api.ts`](frontend/src/lib/api.ts))
   - Added `analyzeImage()` function to `modelsApi`
   - Handles multipart/form-data upload

2. **Image Analysis Page** ([`frontend/src/app/analyze-image/page.tsx`](frontend/src/app/analyze-image/page.tsx))
   - Image upload with drag-and-drop support
   - Preview functionality
   - Predefined and custom prompts
   - Real-time analysis results display
   - Error handling and loading states

3. **Navigation** ([`frontend/src/app/page.tsx`](frontend/src/app/page.tsx))
   - Added "Analyze Image" button on the home page

## Usage

### Starting the Application

1. **Start the backend and frontend:**
   ```bash
   cd /mnt/hdd/data/family_health_copilot
   ./start_all.sh
   ```

2. **Wait for models to load:**
   - Watch the backend logs for: `✅ Models loaded successfully!`
   - The image analyzer will be loaded along with other models

### Using the Web Interface

1. Navigate to `http://localhost:3000`
2. Click the **"Analyze Image"** button
3. Upload a medical image (JPEG, PNG, etc.)
4. Choose a predefined prompt or enter a custom one
5. Click **"Analyze Image"**
6. View the AI-generated analysis

### Testing the API Directly

Run the test script:
```bash
python test_image_analysis.py
```

Or use curl:
```bash
curl -X POST http://localhost:8002/api/v1/models/analyze-image \
  -F "image=@/path/to/xray.png" \
  -F "prompt=Describe this X-ray in detail" \
  -F "max_new_tokens=2000"
```

## API Specification

### POST /api/v1/models/analyze-image

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `image` (file, required): Medical image file (max 10MB)
  - `prompt` (string, optional): Analysis prompt (default: "Describe this medical image in detail")
  - `max_new_tokens` (int, optional): Maximum tokens in response (default: 2000, range: 100-4000)

**Response:**
```json
{
  "analysis": "Detailed AI-generated analysis of the image...",
  "processing_time_ms": 1234.56
}
```

**Errors:**
- `400`: Invalid image file or parameters
- `413`: Image file too large (>10MB)
- `500`: Analysis failed (model error, CUDA OOM, etc.)

## Model Information

- **Model:** google/medgemma-1.5-4b-it
- **Task:** Image-text-to-text (vision-language model)
- **Device:** CUDA (if available) or CPU
- **Precision:** bfloat16 (CUDA) or float32 (CPU)

## Features

### Supported Image Formats
- JPEG
- PNG
- Most formats supported by PIL/Pillow

### Predefined Prompts
1. "Describe this medical image in detail"
2. "What are the key findings in this X-ray?"
3. "Is there anything abnormal in this image?"
4. "Describe the anatomy visible in this image"

### Custom Prompts
Users can enter custom prompts for specific analysis needs:
- "Focus on the heart size and shape"
- "Describe any lung abnormalities"
- "Compare with normal anatomy"

## Limitations

1. **File Size:** Maximum 10MB per image
2. **Processing Time:** Depends on image size and model complexity (typically 10-60 seconds)
3. **Memory:** Requires GPU with sufficient VRAM for the MedGemma model
4. **Medical Disclaimer:** Analysis is for informational purposes only and does not constitute medical advice

## Technical Details

### Image Processing Pipeline

1. **Upload:** Frontend sends image as multipart/form-data
2. **Validation:** Backend validates file size and type
3. **Conversion:** Image is converted to PIL Image format
4. **Color Space:** Converted to RGB if necessary
5. **Inference:** MedGemma model processes image and prompt
6. **Response:** Generated text is returned to frontend

### Model Loading

The image analyzer is loaded during backend startup using the singleton pattern:

```python
# In ModelService.__init__()
self._image_analyzer = MedGemmaImageAnalyzer(self.model_id)
```

This ensures:
- Model is loaded once at startup
- All requests share the same model instance
- No repeated loading overhead
- Efficient memory usage

## Troubleshooting

### Common Issues

1. **"Image analyzer not loaded"**
   - Check backend logs for loading errors
   - Ensure model path is correct
   - Verify sufficient GPU memory

2. **"Image analysis failed"**
   - Check if CUDA is available: `torch.cuda.is_available()`
   - Try reducing `max_new_tokens`
   - Check GPU memory usage: `nvidia-smi`

3. **Slow response times**
   - First request may be slower (warm-up)
   - Consider reducing image resolution
   - Check GPU utilization

4. **Frontend upload errors**
   - Check browser console for errors
   - Verify CORS settings in backend
   - Ensure API_BASE_URL is correct

## Future Enhancements

Potential improvements:
- Batch image analysis
- DICOM file support
- Region of interest (ROI) selection
- Comparison with previous images
- Export analysis as PDF
- Integration with report generation

## Files Changed

### Backend
- ✅ Created: `backend/app/services/image_analyzer.py`
- ✅ Modified: `backend/app/services/model_service.py`
- ✅ Modified: `backend/app/api/v1/models.py`
- ✅ Modified: `backend/app/models/schemas.py`

### Frontend
- ✅ Created: `frontend/src/app/analyze-image/page.tsx`
- ✅ Modified: `frontend/src/lib/api.ts`
- ✅ Modified: `frontend/src/app/page.tsx`

### Testing
- ✅ Created: `test_image_analysis.py`

## License and Disclaimer

⚠️ **Medical Disclaimer:** This system is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

© 2026 Family Health Copilot
