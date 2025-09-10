# 🛡️ DWAS Scanner - Django Web Application Security Scanner

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive security analysis platform for Django web applications, combining a modern React frontend with a powerful FastAPI backend. DWAS Scanner automatically detects security vulnerabilities, code quality issues, and dependency vulnerabilities in Django projects through multiple industry-standard security tools.

## 🎯 Overview

DWAS Scanner provides a complete security analysis solution for Django applications, featuring:

- **🔍 Multi-Tool Security Scanning**: Bandit, Semgrep, pip-audit, and Pylint integration
- **⚡ Real-time Processing**: Asynchronous task execution with Celery and Redis
- **🎨 Modern Web Interface**: React + TypeScript frontend with professional UI
- **📊 Comprehensive Reports**: Detailed vulnerability analysis and remediation guidance
- **🔄 Continuous Monitoring**: Real-time scan status updates and progress tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │ Security Tools  │
│   (Port 5173)   │◄──►│   (Port 8000)   │◄──►│  Bandit, etc.   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   SQLite DB     │    │   Celery Tasks  │
│   & Dashboard   │    │   Job Storage   │    │   Redis Queue   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚙️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for APIs
- **[SQLite](https://www.sqlite.org/)** - Lightweight relational database
- **[Celery](https://docs.celeryq.dev/)** - Distributed task queue for async processing
- **[Redis](https://redis.io/)** - Message broker & result backend for Celery
- **[uvicorn](https://www.uvicorn.org/)** - Fast ASGI server with async I/O support

### Frontend
- **[React 18](https://reactjs.org/)** - Modern UI library with hooks
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://radix-ui.com/)** - Accessible component primitives

### Security Tools
- **[Bandit](https://bandit.readthedocs.io/)** - Static security analysis for Python code
- **[Semgrep](https://semgrep.dev/)** - Rule-based code scanning with Django-specific rules
- **[pip-audit](https://pypi.org/project/pip-audit/)** - Dependency vulnerability scanning
- **[Pylint](https://pylint.org/)** - Code quality and style analysis

## ✨ Features

### 🔐 Security Analysis
- **Multi-tool Integration**: Combines Bandit, Semgrep, pip-audit, and Pylint
- **Django-specific Rules**: Tailored security rules for Django applications
- **Dependency Scanning**: Automatic vulnerability detection in requirements.txt
- **Code Quality Analysis**: Style and best practice enforcement

### 🚀 Performance & Scalability
- **Asynchronous Processing**: Celery-based background task execution
- **Real-time Updates**: Live scan progress monitoring
- **Scalable Architecture**: Redis-backed task queue system
- **Fast API**: High-performance FastAPI backend with automatic documentation

### 🎨 User Experience
- **Modern Web Interface**: React + TypeScript frontend
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Dashboard**: Live scan status and progress tracking
- **Detailed Reports**: Comprehensive vulnerability analysis with remediation guidance

### 🔧 Developer Experience
- **Hot Reload**: Automatic code reloading during development
- **Debug Tools**: Built-in debugging and monitoring capabilities
- **Comprehensive Logging**: Detailed logging for troubleshooting
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

## 📋 Current Status

- [x] **Backend Infrastructure**: FastAPI + SQLite + Celery + Redis
- [x] **Frontend Application**: React + TypeScript + Tailwind CSS
- [x] **Security Tools Integration**: Bandit, Semgrep, pip-audit, Pylint
- [x] **File Upload System**: ZIP file processing and extraction
- [x] **Job Management**: Complete CRUD operations for scan jobs
- [x] **Real-time Monitoring**: Live scan status updates
- [x] **Report Generation**: Detailed security analysis reports
- [x] **Debug Interface**: Developer tools and monitoring
- [x] **Comprehensive Testing**: Unit, integration, performance, and security tests
- [x] **CI/CD Pipeline**: Automated testing and deployment workflows
- [x] **Documentation**: Comprehensive technical documentation


## 🚀 Quick Start

### Prerequisites
- **Python 3.13+**
- **Node.js 18+**
- **Redis Server**
- **Conda** (recommended) or pip

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DWAS_scanner
```

### 2. Set Up Environment
```bash
# Create conda environment
conda create -n DWAS_env python=3.13
conda activate DWAS_env

# Install Python dependencies
pip install fastapi uvicorn bandit semgrep pip-audit pylint flake8 sqlalchemy python-multipart
pip install "celery[redis]"

```

### 3. Start Redis Server
```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS (with Homebrew)
brew services start redis

# Or run directly
redis-server
```

### 4. Launch Development Environment

```bash
# Terminal 1: Start Celery Worker
conda activate DWAS_env
celery -A backend.celery_worker.celery_app worker --loglevel=info

# Terminal 2: Start FastAPI Backend
conda activate DWAS_env
uvicorn backend.main:app --reload

# Terminal 3: Start React Frontend
cd frontend/dwas-visualizer-main/
npm install
npm run dev
```

## 🌐 Service URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 📂 Project Structure

```
DWAS_scanner/
├── 📁 backend/                    # FastAPI backend
│   ├── 📄 main.py                # FastAPI application entry point
│   ├── 📄 models.py              # SQLAlchemy database models
│   ├── 📄 tasks.py               # Celery background tasks
│   ├── 📄 celery_worker.py       # Celery configuration
│   ├── 📄 database.py            # Database connection setup
│   ├── 📄 logger.py              # Logging configuration
│   ├── 📁 uploads/               # Uploaded Django project files
│   └── 📁 reports/               # Generated scan reports
├── 📁 frontend/                  # React frontend
│   └── 📁 dwas-visualizer-main/  # Main frontend application
│       ├── 📄 package.json       # Node.js dependencies
│       ├── 📁 src/               # React source code
│       │   ├── 📁 components/    # Reusable UI components
│       │   ├── 📁 pages/         # Application pages
│       │   ├── 📁 hooks/         # Custom React hooks
│       │   ├── 📁 services/      # API service layer
│       │   └── 📁 utils/         # Utility functions
│       └── 📄 vite.config.ts     # Vite build configuration
├── 📁 scanner/                   # Security scanning tools
│   └── 📄 scanner.py             # Main scanning logic
├── 📁 tests/                     # Comprehensive test suite
│   ├── 📁 backend/               # Backend unit tests
│   ├── 📁 scanner/               # Scanner module tests
│   ├── 📁 integration/           # Integration tests
│   ├── 📁 performance/           # Performance tests
│   ├── 📁 security/              # Security tests
│   └── 📄 conftest.py            # Test configuration
├── 📄 run_tests.py               # Test runner script
├── 📄 pytest.ini                # Pytest configuration
├── 📄 requirements-test.txt      # Testing dependencies
├── 📄 Makefile                   # Development automation
├── 📄 activate.sh                # Development environment launcher
├── 📄 .tmux.conf                 # tmux configuration
├── 📄 .gitignore                 # Git ignore rules
├── 📄 DOCUMENTATION.md           # Technical documentation
├── 📄 test_cases.md              # Test cases documentation
├── 📄 README_LOGGING.md          # Logging documentation
├── 📄 TROUBLESHOOTING.md         # Troubleshooting guide
└── 📄 jobs.db                    # SQLite database
```

## 🧪 Testing

### Test Suite Overview
DWAS Scanner includes a comprehensive testing suite covering all aspects of the application:

- **Unit Tests**: Individual component testing with mocked dependencies
- **Integration Tests**: End-to-end API workflow testing
- **Performance Tests**: Load testing and performance benchmarking
- **Security Tests**: Security vulnerability and attack simulation testing

### Running Tests
```bash
# Run all tests
make test
# or
python run_tests.py --all

# Run specific test categories
make test-unit          # Unit tests only
make test-integration   # Integration tests only
make test-performance   # Performance tests only
make test-security      # Security tests only

# Run with coverage
make test-coverage

# Run code quality checks
make lint
make format
```

### Test Automation
- **CI/CD Pipeline**: Automated testing on GitHub Actions
- **Code Quality**: Automated linting, formatting, and type checking
- **Security Scanning**: Automated security vulnerability detection
- **Coverage Reporting**: Comprehensive test coverage analysis

## 📚 Documentation

### 📖 Technical Documentation
- **[Complete Architecture Guide](DOCUMENTATION.md)** - Detailed frontend/backend integration
- **[Test Cases Documentation](test_cases.md)** - Comprehensive test case documentation
- **[Logging System](README_LOGGING.md)** - Comprehensive logging documentation
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions

### 🔧 Development Resources
- **[API Documentation](http://localhost:8000/docs)** - Interactive API explorer
- **[Frontend Components](frontend/dwas-visualizer-main/README.md)** - React component documentation
- **[Security Tools](scanner/scanner.py)** - Security scanning implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. {[LICENSE](LICENSE)}

## 🆘 Support

- **Documentation**: Check the [technical documentation](DOCUMENTATION.md)
- **Issues**: Report bugs and request features via GitHub Issues
- **Troubleshooting**: See the [troubleshooting guide](TROUBLESHOOTING.md)
- **Logging**: Review the [logging documentation](README_LOGGING.md)

