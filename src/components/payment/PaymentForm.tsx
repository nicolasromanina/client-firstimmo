import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBecomePromoteurSubscription } from "@/hooks/useApi";
import { becomePromoteurService } from "@/lib/services";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Noms et prix des plans pour le récapitulatif
 * Prix annuels en euros HT
 */
const planNames: Record<string, string> = {
  starter: "Starter",
  publie: "Publié",
  verifie: "Vérifié",
  partenaire: "Partenaire",
  enterprise: "Enterprise",
};

const planPrices: Record<string, number> = {
  starter: 600,
  publie: 1500,
  verifie: 4200,
  partenaire: 7200,
  enterprise: 0,
};

/**
 * Style commun pour les Stripe Elements (adapté au design existant)
 */
const stripeElementStyle = {
  base: {
    fontSize: "14px",
    color: "#111827",
    fontFamily: "Inter, system-ui, sans-serif",
    "::placeholder": { color: "#6b7280" },
  },
  invalid: {
    color: "#ef4444",
    iconColor: "#ef4444",
  },
};

interface PaymentFormProps {
  plan: string;
}

/**
 * Composant PaymentForm — Formulaire de paiement avec Stripe Elements
 * Les champs carte sont des composants Stripe sécurisés (PCI compliant).
 * Le paiement est confirmé directement sur cette page, sans redirection Stripe Checkout.
 */
const PaymentForm = ({ plan }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createSubscription = useCreateBecomePromoteurSubscription();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    organizationName: "",
    organizationType: "individual",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Track Stripe Elements validation state
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvcError, setCvcError] = useState<string | null>(null);

  const allCardFieldsValid = cardComplete && expiryComplete && cvcComplete;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe n'est pas encore prêt");
      return;
    }

    if (!formData.organizationName.trim()) {
      toast.error("Veuillez entrer le nom de votre organisation");
      return;
    }

    if (!allCardFieldsValid) {
      toast.error("Veuillez remplir correctement les informations de carte");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create a PaymentMethod from the card element
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        toast.error("Erreur : champ de carte introuvable");
        setIsProcessing(false);
        return;
      }

      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
          },
        });

      if (pmError) {
        toast.error(pmError.message || "Erreur lors de la validation de la carte");
        setIsProcessing(false);
        return;
      }

      // 2. Create subscription on the backend (returns clientSecret + subscriptionId)
      const { clientSecret, subscriptionId } = await createSubscription.mutateAsync({
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        plan,
        paymentMethodId: paymentMethod.id,
      });

      // 3. Confirm the payment with the clientSecret
      const { error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: paymentMethod.id }
      );

      if (confirmError) {
        toast.error(
          confirmError.message || "Le paiement a échoué. Veuillez réessayer."
        );
        setIsProcessing(false);
        return;
      }

      // 4. Confirm with backend to activate promoteur profile
      try {
        await becomePromoteurService.confirmPayment(subscriptionId);
      } catch (confirmErr) {
        console.error('Backend confirm error:', confirmErr);
        // Non-blocking — webhook will pick it up eventually
      }

      // 5. Payment succeeded — redirect to success page
      toast.success("Paiement réussi ! Bienvenue, Promoteur !");
      navigate("/devenir-promoteur/success?session_id=inline");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du paiement. Veuillez réessayer."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Récapitulatif du plan */}
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Plan {planNames[plan] || plan}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Abonnement annuel</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {planPrices[plan] || 0}€
            </p>
            <p className="text-xs text-gray-500">/an</p>
          </div>
        </div>
      </div>

      {/* Champ Prénom */}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Prénom(s) *
        </label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          placeholder="Veuillez saisir votre prénom"
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-coral-500 focus:outline-none"
        />
      </div>

      {/* Champ Nom */}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Nom *
        </label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          placeholder="Nom de famille"
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-coral-500 focus:outline-none"
        />
      </div>

      {/* Champ Email */}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Adresse Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Votre adresse mail"
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-coral-500 focus:outline-none"
        />
      </div>

      {/* Champ Nom de l'organisation */}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Nom de l'organisation *
        </label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => handleChange("organizationName", e.target.value)}
          placeholder="Ex: Immobilière du Sahel, BTP Innovation..."
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-coral-500 focus:outline-none"
        />
      </div>

      {/* Type d'organisation */}
      <div className="mb-6">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Type d'organisation
        </label>
        <select
          value={formData.organizationType}
          onChange={(e) => handleChange("organizationType", e.target.value)}
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-coral-500 focus:outline-none appearance-none"
        >
          <option value="individual">Promoteur individuel</option>
          <option value="small">Petite entreprise</option>
          <option value="established">Entreprise établie</option>
          <option value="enterprise">Grand groupe</option>
        </select>
      </div>

      {/* Section Mode de Paiement */}
      <div className="mb-4">
        <p className="text-center text-gray-900 text-sm font-medium mb-4">
          Mode de Paiement
        </p>

        {/* Logos des cartes de paiement */}
        <div className="flex items-center justify-center gap-4 p-4 border border-gray-200 rounded-lg mb-4">
          {/* Visa */}
          <div className="h-6 sm:h-8">
            <svg viewBox="0 0 48 16" className="h-full w-auto">
              <text
                x="0"
                y="14"
                className="text-sm font-bold fill-blue-700"
                style={{ fontFamily: "Arial, sans-serif", fontStyle: "italic" }}
              >
                VISA
              </text>
            </svg>
          </div>

          {/* Mastercard */}
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full -mr-2"></div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full opacity-80"></div>
          </div>

          {/* American Express */}
          <div className="h-6 sm:h-8 bg-blue-600 rounded px-2 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AMEX</span>
          </div>

          {/* Discover */}
          <div className="h-6 sm:h-8">
            <span className="text-gray-900 text-xs sm:text-sm font-bold tracking-tight">
              DISC<span className="text-coral-500">O</span>VER
            </span>
          </div>
        </div>
      </div>

      {/* Numéro de carte — Stripe Element */}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Numéro de la carte *
        </label>
        <div className="bg-gray-100 rounded-lg px-4 py-3.5">
          <CardNumberElement
            options={{
              style: stripeElementStyle,
              showIcon: true,
              placeholder: "1234 1234 1234 1234",
            }}
            onChange={(e) => {
              setCardComplete(e.complete);
              setCardError(e.error?.message || null);
            }}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-xs mt-1.5">{cardError}</p>
        )}
      </div>

      {/* Date d'expiration et CVC — Stripe Elements */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-900 text-sm font-medium mb-2">
            Date d'expiration *
          </label>
          <div className="bg-gray-100 rounded-lg px-4 py-3.5">
            <CardExpiryElement
              options={{
                style: stripeElementStyle,
                placeholder: "MM / AA",
              }}
              onChange={(e) => {
                setExpiryComplete(e.complete);
                setExpiryError(e.error?.message || null);
              }}
            />
          </div>
          {expiryError && (
            <p className="text-red-500 text-xs mt-1.5">{expiryError}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-900 text-sm font-medium mb-2">
            Code de sécurité *
          </label>
          <div className="bg-gray-100 rounded-lg px-4 py-3.5">
            <CardCvcElement
              options={{
                style: stripeElementStyle,
                placeholder: "CVC",
              }}
              onChange={(e) => {
                setCvcComplete(e.complete);
                setCvcError(e.error?.message || null);
              }}
            />
          </div>
          {cvcError && (
            <p className="text-red-500 text-xs mt-1.5">{cvcError}</p>
          )}
        </div>
      </div>

      {/* Bouton de paiement */}
      <button
        onClick={handleSubmit}
        disabled={
          isProcessing ||
          !stripe ||
          !formData.organizationName.trim() ||
          !allCardFieldsValid
        }
        className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors duration-200 text-base flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement du paiement...
          </>
        ) : (
          <>Payer {planPrices[plan] || 0}€ / an</>
        )}
      </button>

      {/* Sécurité */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
        <Shield className="w-4 h-4" />
        Paiement sécurisé par Stripe — Vos données sont protégées
      </div>
    </div>
  );
};

export default PaymentForm;
