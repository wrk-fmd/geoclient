/**
 * This namespace contains helper methods for retrieving and sending data through HTTP
 */
export namespace Http {

  /**
   * Retrieves the content of a remote file as string
   * @param url The URL to the file
   * @return The text content of the file
   */
  export async function getText<T>(url: string): Promise<string> {
    const response = await getResponse(url);
    return response.text();
  }

  /**
   * Retrieves the parsed object in a remote JSON file
   * @param url The URL to the JSON file
   * @return The object parsed from the JSON string
   */
  export async function getJson<T>(url: string): Promise<T> {
    const response = await getResponse(url);
    return response.json();
  }

  /**
   * Sends data as JSON with a POST request
   * @param url The URL to POST to
   * @param body The body which will be serialized as JSON
   */
  export async function postJson<T>(url: string, body: T): Promise<void> {
    await getResponse(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Sends a request and obtains the response if the request was successful
   * @param url The URL
   * @param init Default request init options for {@link fetch}
   * @return The response to the request
   */
  export async function getResponse(url: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      ...init,
      referrer: '',
    });
    if (!response.ok) {
      throw new Error(`HTTP request to ${response.url} failed: ${response.status} (${response.statusText})`);
    }
    return response;
  }
}
