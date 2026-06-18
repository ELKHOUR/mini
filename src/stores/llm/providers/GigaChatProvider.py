from ..LLMInterface import LLMInterface
from ..LLMEnums import OpenAIEnums
import httpx
import uuid
import time
import logging
from typing import List, Union


class GigaChatProvider(LLMInterface):

    def __init__(self, api_key: str,
                 token_url: str,
                 base_url: str,
                 scope: str,
                 default_input_max_characters: int = 1000,
                 default_generation_max_output_tokens: int = 1000,
                 default_generation_temperature: float = 0.1,
                 verify_ssl: bool = False):

        self.api_key = api_key
        self.token_url = token_url
        self.base_url = base_url
        self.scope = scope
        self.default_input_max_characters = default_input_max_characters
        self.default_generation_max_output_tokens = default_generation_max_output_tokens
        self.default_generation_temperature = default_generation_temperature
        self.verify_ssl = verify_ssl

        self.generation_model_id = None
        self.embedding_model_id = None
        self.embedding_size = None

        self._access_token = None
        self._token_expires_at = 0.0

        self.enums = OpenAIEnums
        self.logger = logging.getLogger(__name__)

    def _get_token(self):
        if self._access_token and time.time() < self._token_expires_at - 60:
            return self._access_token

        try:
            resp = httpx.post(
                self.token_url,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "RqUID": str(uuid.uuid4()),
                    "Authorization": f"Basic {self.api_key}",
                },
                data={"scope": self.scope},
                verify=self.verify_ssl,
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
            self._access_token = data["access_token"]
            self._token_expires_at = data["expires_at"] / 1000
            return self._access_token
        except Exception as e:
            self.logger.error(f"GigaChat token fetch failed: {e}")
            return None
        


    def set_generation_model(self, model_id: str):
        self.generation_model_id = model_id

    def set_embedding_model(self, model_id: str, embedding_size: int):
        # Not used — embeddings handled by Ollama
        self.embedding_model_id = model_id
        self.embedding_size = embedding_size

    def process_text(self, text: str):
        return text[:self.default_input_max_characters].strip()

    def generate_text(self, prompt: str, chat_history: list = [],
                      max_output_tokens: int = None, temperature: float = None):

        token = self._get_token()
        if not token:
            self.logger.error("Could not get GigaChat token")
            return None

        if not self.generation_model_id:
            self.logger.error("Generation model for GigaChat was not set")
            return None

        max_output_tokens = max_output_tokens or self.default_generation_max_output_tokens
        temperature = temperature or self.default_generation_temperature

        chat_history.append(
            self.construct_prompt(prompt=prompt, role=OpenAIEnums.USER.value)
        )

        try:
            resp = httpx.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.generation_model_id,
                    "messages": chat_history,
                    "max_tokens": max_output_tokens,
                    "temperature": temperature,
                },
                verify=self.verify_ssl,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            self.logger.error(f"GigaChat generation error: {e}")
            return None

    def embed_text(self, text: Union[str, List[str]], document_type: str = None):
        self.logger.warning("GigaChat embed_text called — use Ollama for embeddings")
        return None

    def construct_prompt(self, prompt: str, role: str):
        return {
            "role": role,
            "content": prompt,
        }