from .BaseController import BaseController
from .ProjectController import ProjectController
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import PyMuPDFLoader
from models import ProcessingEnum


class ProcessController(BaseController):
    def __init__(self, project_id: str):  # أضف user_id
        super().__init__()

        self.project_id = project_id
        self.project_path = ProjectController().get_project_path(
            project_id=project_id,
        )

    # def get_all_project_files(self):
    #     if not os.path.exists(self.project_path):
    #         return []        
    #     return os.listdir(self.project_path)


    def get_file_extension(self, file_id: str):
        return os.path.splitext(file_id)[-1]

    def get_file_loader(self, file_id: str):
        file_ext = self.get_file_extension(file_id=file_id)
        file_path = os.path.join(
            self.project_path,
            file_id
        )
   
        if file_ext == ProcessingEnum.TXT.value:
            return TextLoader(file_path, encoding="utf-8")

        if file_ext == ProcessingEnum.PDF.value:
            return PyMuPDFLoader(file_path)
        
        return None

    def get_file_content(self, file_id: str):
        file_path = os.path.join(self.project_path, file_id)
    
        if not os.path.exists(file_path):
            return None
            
        loader = self.get_file_loader(file_id=file_id)
        if loader is None:
            return None
        try:
            return loader.load()
        except Exception as e:
            return None

    def process_file_content(self, file_content: list, file_id: str, chunk_size: int=100, overlap_size: int=20):
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap_size,
            length_function=len,
        )

        file_content_texts = [
            rec.page_content
            for rec in file_content
        ]

        file_content_metadata = [
            rec.metadata
            for rec in file_content
        ]

        chunks = text_splitter.create_documents(
            file_content_texts,
            metadatas=file_content_metadata
        )

        return chunks
    

    # def process_all_files(self, chunk_size: int = 100, overlap_size: int = 20):
        all_chunks = []

        for file_id in self.get_all_project_files():
            loader = self.get_file_loader(file_id=file_id)

            if loader is None:
                continue

            file_content = loader.load()
            chunks = self.process_file_content(
                file_content=file_content,
                file_id=file_id,
                chunk_size=chunk_size,
                overlap_size=overlap_size
            )

            all_chunks.extend(chunks)

        return all_chunks