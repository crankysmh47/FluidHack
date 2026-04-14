# ── Stage 1: Build the React Frontend ────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python Backend + Serve Static Files ─────────────────────────────
FROM python:3.11-slim

# HuggingFace Spaces runs as user 1000
RUN useradd -m -u 1000 user
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY glue/ ./glue/
COPY sentinel_core/ ./sentinel_core/
COPY carbon_emissions.json ./
COPY tx_hashes.jsonl ./

# Copy the built React frontend into a folder Flask will serve
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Give ownership of the /app directory to the user so we can write local db/logs
RUN chown -R user:user /app

# Switch to non-root user (required by HuggingFace)
USER user

# HuggingFace Spaces MUST use port 7860
ENV PORT=7860
EXPOSE 7860

# Start with gunicorn
CMD ["gunicorn", "--chdir", "glue", "api_server:app", "--bind", "0.0.0.0:7860", "--timeout", "120"]
