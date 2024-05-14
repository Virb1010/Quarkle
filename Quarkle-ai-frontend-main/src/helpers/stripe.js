export async function handlePayment(plan, user, router, setError, setIsLoading) {
  try {
    setIsLoading(true);
    const response = await fetch("/api/stripe/get-payment-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan, userEmail: user.email }),
    });

    if (!response.ok) {
      // If the response status code is not OK, throw an error with the response status
      const errorData = await response.json();
      throw new Error(errorData.error.message || "An unknown error occurred");
    }

    const data = await response.json();
    if (data.url) {
      router.push(data.url); // Redirect to Stripe's checkout page
    }
  } catch (error) {
    console.error("Error:", error);
    // Set error for 5 secs
    setError(error);
    setTimeout(() => {
      setError(null);
    }, 5000);
  } finally {
    setIsLoading(false);
  }
}

export async function handleManageAccount(subscription, router, setError, setIsLoading) {
  try {
    setIsLoading(true);
    if (!subscription) return;

    const response = await fetch("/api/stripe/get-customer-portal-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId: subscription.stripe_customer_id }), // Assuming subscription ID is stored in the context
    });

    if (!response.ok) {
      // If the response status code is not OK, throw an error with the response status
      const errorData = await response.json();
      throw new Error(errorData.error.message || "An unknown error occurred");
    }

    const data = await response.json();
    if (data.url) {
      router.push(data.url); // Redirect to Stripe's customer portal
    }
  } catch (error) {
    console.error("Error:", error);
    // Set error for 5 secs
    setError(error);
    setTimeout(() => {
      setError(null);
    }, 5000);
  } finally {
    setIsLoading(false);
  }
}
