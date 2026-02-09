import { loadStripe } from "@stripe/stripe-js";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";

if (!stripePublicKey) {
  console.warn(
    "VITE_STRIPE_PUBLIC_KEY n'est pas défini dans les variables d'environnement"
  );
}

export const stripePromise = loadStripe(stripePublicKey);
