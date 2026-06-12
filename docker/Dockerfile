# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libavif-dev pkg-config \
    libjpeg-dev \
    gcc unzip zip \
    libxml2-dev \
    libxslt1-dev \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy requirements first (for Docker cache optimization)
COPY src/requirements.txt .


# Install Python dependencies with uv (much faster than pip)
RUN uv pip install --system --no-cache -r requirements.txt

# Copy source code
COPY src/ .

# Create directory structure for Alembic
RUN mkdir -p models/db_schemes/minirag

COPY docer/minirag/alembic.ini /app/models/db_schemes/minirag/

COPY docker/minirag/alembic.ini /app/models/db_schemes/minirag/alembic.ini


COPY docker/minirag/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]


# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]