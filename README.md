# mini-RAG

this is a minial implementation of the RAG model for question answering.

# Requirements

- Python 3.12.0

#### Install Python 

1) Install python 

2) Create a new Environment using the following command:
```
python -m venv venv

```
3) Activate the Environment 
```
venv/Scripts/activate
```

## Installation

#### Install the required packages

```
pip install -r requirements.txt
```

#### Setup the environment variables

```
cp .env.example .env
```

#### Run the FastAPI server

```
uvicorn main:app --reload
```
## Run Docker Compose Sevices

``` bash
$ cd docker
$ cp .env.example .env
```

~ update `.env` with your credentials

