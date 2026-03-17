export function getRequestBody(req) {
    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                if (!body) {
                    return resolve({});
                }

                const contentType = req.headers['content-type'] || '';

                if (contentType.includes('application/json')) {
                    return resolve(JSON.parse(body));
                }

                if (contentType.includes('application/x-www-form-urlencoded')) {
                    const params = new URLSearchParams(body);
                    const parsed = Object.fromEntries(params.entries());
                    return resolve(parsed);
                }

                try {
                    return resolve(JSON.parse(body));
                } catch {
                    const params = new URLSearchParams(body);
                    const parsed = Object.fromEntries(params.entries());
                    return resolve(parsed);
                }
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);

    });
}