import {
  RequestBody as MessageRequestBody,
  ResponseBody as MessageResponseBody,
} from "@/app/api/process-message/route";
import {
  RequestBody as ConfigBotRequestBody,
  ResponseBody as ConfigBotResponseBody,
} from "@/app/api/configure-bot/route";
import {
  RequestBody as ClearHistoryRequestBody,
  ResponseBody as ClearHistoryResponseBody,
} from "@/app/api/clear-history/route";
import {
  RequestParams as GetBotRequestParams,
  ResponseBody as GetBotResponseBody,
} from "@/app/api/get-bot/route";

export function sendMessageToAPI(
  body: MessageRequestBody
): Promise<MessageResponseBody> {
  return new Promise((resolve, reject) => {
    function handleFailure(error: any): void {
      reject({
        error,
        text: "Sorry, I'm unable to provide an answer right now. Please try again or reload the page",
      });
    }

    try {
      function processResponse(
        response: Response
      ): Promise<MessageResponseBody> {
        if (response.status !== 200) {
          handleFailure(new Error("Response code different than 200"));
        }
        return response.text();
      }

      function processResponseData(text: MessageResponseBody): void {
        resolve(text);
      }

      const url = new URL("http://localhost:3000/api/process-message");
      const options = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      };
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((text) => processResponseData(text))
        .catch((err) => handleFailure(err));
    } catch (err) {
      handleFailure(err);
    }
  });
}

export function sendBotConfigurationToAPI(
  body: ClearHistoryRequestBody,
  fallback?: ClearHistoryRequestBody
): Promise<ConfigBotResponseBody> {
  return new Promise((resolve, reject) => {
    function handleFailure(error: any): void {
      reject({
        error,
        text: "Failed to configure bot",
        fallback,
      });
    }

    try {
      function processResponse(
        response: Response
      ): Promise<ConfigBotResponseBody> {
        if (response.status !== 200) {
          handleFailure(new Error("Response code different than 200"));
        }
        return response.json();
      }

      function processResponseData(data: ConfigBotResponseBody): void {
        resolve(data);
      }

      const url = new URL("http://localhost:3000/api/configure-bot");
      const options = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      };
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((text) => processResponseData(text))
        .catch((err) => handleFailure(err));
    } catch (err) {
      handleFailure(err);
    }
  });
}

export function sendClearHistoryToAPI(
  body: ClearHistoryRequestBody,
  fallback?: ClearHistoryRequestBody
): Promise<ClearHistoryResponseBody> {
  return new Promise((resolve, reject) => {
    function handleFailure(error: any): void {
      reject({
        error,
        text: "Failed to clear history",
        fallback,
      });
    }

    try {
      function processResponse(
        response: Response
      ): Promise<ClearHistoryResponseBody> {
        if (response.status !== 200) {
          handleFailure(new Error("Response code different than 200"));
        }
        return response.text();
      }

      function processResponseData(data: ClearHistoryResponseBody): void {
        resolve(data);
      }

      const url = new URL("http://localhost:3000/api/clear-history");
      const options = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      };
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((text) => processResponseData(text))
        .catch((err) => handleFailure(err));
    } catch (err) {
      handleFailure(err);
    }
  });
}

export function getBotFromAPI(
  params: GetBotRequestParams
): Promise<GetBotResponseBody> {
  return new Promise((resolve, reject) => {
    function handleFailure(error: any): void {
      reject({
        error,
        text: "Failed to get bot",
      });
    }

    try {
      function processResponse(
        response: Response
      ): Promise<GetBotResponseBody> {
        if (response.status !== 200) {
          handleFailure(new Error("Response code different than 200"));
        }
        return response.json();
      }

      function processResponseData(data: GetBotResponseBody): void {
        resolve(data);
      }

      const url = new URL("http://localhost:3000/api/get-bot");
      url.search = new URLSearchParams(params).toString();
      const options = { method: "GET" };
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((text) => processResponseData(text))
        .catch((err) => handleFailure(err));
    } catch (err) {
      handleFailure(err);
    }
  });
}
