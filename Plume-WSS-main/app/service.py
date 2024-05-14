import os
import time
from openai import OpenAI
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    before_sleep_log,
)
from websockets.exceptions import ConnectionClosedOK
import logging
from openai._exceptions import OpenAIError

from openai._types import NOT_GIVEN
import time
from functools import partial, wraps
import inspect

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def measure_execution_time(coroutine_func):
    @wraps(coroutine_func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            return await coroutine_func(*args, **kwargs)
        finally:
            end_time = time.time()
            elapsed_time = end_time - start_time
            logger.info(
                f"Execution time for {coroutine_func.__name__}: {elapsed_time} seconds"
            )

    return wrapper


model_configs = {
    "ChronosHermes": {
        "base_url": "https://api.together.xyz",
        "api_key": os.environ.get("TOGETHER_API_KEY"),
        "model": "Austism/chronos-hermes-13b",
        "timeout": 30,
        "max_tokens": 500,
        "temperature": 0.7,
    },
    "Yi": {
        "base_url": "https://api.together.xyz",
        "api_key": os.environ.get("TOGETHER_API_KEY"),
        "model": "NousResearch/Nous-Hermes-2-Yi-34B",
        "timeout": 30,
        "max_tokens": 516,
        "stop": ["<|im_start|>", "<|im_end|>"],
    },
    "OpenHermes": {
        "base_url": "https://api.together.xyz",
        "api_key": os.environ.get("TOGETHER_API_KEY"),
        "model": "teknium/OpenHermes-2p5-Mistral-7B",
        "timeout": 30,
        "max_tokens": 4000,
        "temperature": 0.7,
    },
    "Mixtral": {
        "base_url": "https://api.fireworks.ai/inference/v1",
        "api_key": os.environ.get("FIREWORKS_API_KEY"),
        "model": "accounts/fireworks/models/mixtral-8x7b-instruct",
        "timeout": 30,
        "max_tokens": 32000,
    },
    "GPT4": {
        "api_key": os.environ.get("OPENAI_API_KEY"),
        "model": "gpt-4-1106-preview",
        "timeout": 30,
    },
    "GPT3.5": {
        "api_key": os.environ.get("OPENAI_API_KEY"),
        "model": "gpt-3.5-turbo-1106",
        "timeout": 12,
    },
    "NousMixtral": {
        "base_url": "https://api.together.xyz",
        "api_key": os.environ.get("TOGETHER_API_KEY"),
        "model": "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
        "timeout": 30,
        "max_tokens": 15000,
        "temperature": 0.7,
    },
}


def get_model_client(use_pro_model, use_open_expression_model=False, model_name=None):
    """
    If model_name is specified, use that model.
    Otherwise, use the model specified by use_pro_model and use_open_expression_model.
    Finally, default to GPT3.5.
    """
    model_config = None

    if model_name:
        model_config = model_configs[model_name]

    if use_open_expression_model and not model_config:
        model_config = model_configs["NousMixtral"]

    if use_pro_model and not model_config:
        model_config = model_configs["GPT4"]

    if not model_config:
        model_config = model_configs["GPT3.5"]

    logger.info(f"********** USING MODEL {model_config['model']} **********")

    AsyncClient = AsyncOpenAI(
        base_url=model_config.get("base_url"),
        api_key=model_config.get("api_key"),
    )
    AsyncCompletionsClient = partial(
        AsyncClient.chat.completions.create,
        model=model_config.get("model", NOT_GIVEN),
        timeout=model_config.get("timeout", NOT_GIVEN),
        max_tokens=model_config.get("max_tokens", NOT_GIVEN),
        temperature=model_config.get("temperature", NOT_GIVEN),
    )
    return AsyncCompletionsClient


@retry(
    wait=wait_random_exponential(min=0, max=15),
    before_sleep=before_sleep_log(logger, logging.INFO),
    stop=stop_after_attempt(8),
)
@measure_execution_time
async def CallOpenAI(messages, json_mode=False, use_pro_model=False):
    ModelCompletionsClient = get_model_client(False, model_name="GPT3.5")

    response = await ModelCompletionsClient(
        response_format={"type": "json_object"},
        messages=messages,
    )

    return response.choices[0].message.content


@retry(
    wait=wait_random_exponential(min=0, max=15),
    before_sleep=before_sleep_log(logger, logging.INFO),
    stop=stop_after_attempt(8),
)
@measure_execution_time
async def StreamOpenAI(
    messages,
    websocket,
    use_pro_model=False,
    use_open_expression_model=False,
):
    tokens_used = 0
    response_str = ""
    ModelCompletionsClient = get_model_client(use_pro_model, use_open_expression_model)

    try:
        response = await ModelCompletionsClient(messages=messages, stream=True)

        async for chunk in response:
            token = chunk.choices[0].delta.content
            if token:
                tokens_used += 1
                if websocket:
                    await websocket.send(token)
                response_str += str(token)

    except ConnectionClosedOK:
        logger.info("WebSocket connection closed by Client.")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise

    return tokens_used, response_str


@retry(
    wait=wait_random_exponential(min=0, max=15),
    before_sleep=before_sleep_log(logger, logging.INFO),
    stop=stop_after_attempt(16),
)
@measure_execution_time
async def CallOpenAIFunction(messages, tools, use_pro_model=False):
    # logger.info("Starting OpenAI function request")
    ModelCompletionsClient = get_model_client(use_pro_model)

    try:
        completion = await ModelCompletionsClient(
            messages=messages,
            tools=tools,
            timeout=60,
        )
        tool_calls = completion.choices[0].message.tool_calls
        function = tool_calls[0].function if tool_calls else None
    except OpenAIError as e:
        # logger.error(f"OpenAI API Error: {e}")
        raise  # Re-raise the exception to trigger the retry logic
    finally:
        pass  # DELETE THIS LINE
        # logger.info("Finished OpenAI function request")

    return function
