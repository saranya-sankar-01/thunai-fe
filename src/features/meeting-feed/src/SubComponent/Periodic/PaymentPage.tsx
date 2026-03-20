const PaymentPage = () => {
  const planDetails = {
    title: "Upgrade to Periodic Plan",
    description:
      "Access periodic configuration, advanced scheduling, and automated insights.",
    price: "₹499",
    duration: "per month",
    features: [
      "Unlimited periodic configurations",
      "Advanced analytics",
      "Auto scheduling",
      "Priority support",
    ],
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {planDetails.title}
        </h2>

        <p className="text-gray-600 mb-4">{planDetails.description}</p>

        <div className="mb-4">
          <span className="text-3xl font-bold text-black">
            {planDetails.price}
          </span>
          <span className="text-gray-500 ml-1">/ {planDetails.duration}</span>
        </div>

        <ul className="space-y-2 mb-6">
          {planDetails.features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✔</span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          onClick={() => alert("Payment flow coming soon")}
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
