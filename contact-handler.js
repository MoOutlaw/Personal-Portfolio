(function () {
    function buildWebhookPayload(formData) {
        return {
            name: formData.get("name") || "",
            email: formData.get("email") || "",
            visitor_phone: formData.get("visitor_phone") || "",
            message: formData.get("message") || "",
            owner_email: formData.get("portfolio_owner_email") || "",
            owner_phone: formData.get("portfolio_owner_phone") || "",
            page: window.location.pathname,
            submitted_at: new Date().toISOString()
        };
    }

    function ensureStatusElement(form) {
        var status = form.parentNode.querySelector(".form-status");
        if (!status) {
            status = document.createElement("p");
            status.className = "form-status";
            form.parentNode.appendChild(status);
        }
        return status;
    }

    async function submitToWeb3Forms(formData) {
        var response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        return response.json();
    }

    async function forwardToWebhook(payload) {
        if (!window.NOTIFY_CONFIG || !window.NOTIFY_CONFIG.webhookUrl) {
            return;
        }

        var webhookData = new FormData();
        Object.keys(payload).forEach(function (key) {
            webhookData.append(key, payload[key]);
        });

        webhookData.append("platform", window.NOTIFY_CONFIG.webhookPlatform || "make");

        await fetch(window.NOTIFY_CONFIG.webhookUrl, {
            method: "POST",
            mode: "no-cors",
            body: webhookData
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        var form = event.currentTarget;
        var status = ensureStatusElement(form);
        var button = form.querySelector(".form-submit");
        var formData = new FormData(form);
        var webhookPayload = buildWebhookPayload(formData);

        status.textContent = "Sending your message...";
        status.className = "form-status is-pending";
        button.disabled = true;

        try {
            var result = await submitToWeb3Forms(formData);

            if (!result.success) {
                throw new Error(result.message || "Unable to send message.");
            }

            await forwardToWebhook(webhookPayload);

            form.reset();
            status.textContent = "Message sent successfully. Mohammed has been notified.";
            status.className = "form-status is-success";
        } catch (error) {
            status.textContent = error.message || "Something went wrong. Please try again.";
            status.className = "form-status is-error";
        } finally {
            button.disabled = false;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var forms = document.querySelectorAll(".contact-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", handleSubmit);
        });
    });
}());
