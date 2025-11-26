import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AccountTypeModal } from "@/components/AccountTypeModal";
import { GeneralUserForm } from "@/components/registration/GeneralUserForm";
import { ServiceProviderForm } from "@/components/registration/ServiceProviderForm";
import { ClientForm } from "@/components/registration/ClientForm";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ArrowLeft } from "lucide-react";

type AccountType = 'general' | 'service_provider' | 'client' | null;

export default function Register() {
  const navigate = useNavigate();
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [selectedType, setSelectedType] = useState<AccountType>(null);

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type);
    setShowTypeModal(false);
  };

  const handleSuccess = () => {
    navigate("/login");
  };

  const getAccountTypeTitle = () => {
    if (selectedType === 'service_provider') return 'Service Provider Registration';
    if (selectedType === 'client') return 'Client Registration';
    return 'General User Registration';
  };

  return (
    <>
      <AccountTypeModal
        open={showTypeModal}
        onClose={() => navigate("/")}
        onSelectType={handleTypeSelect}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={() => {
              if (selectedType) {
                setSelectedType(null);
                setShowTypeModal(true);
              } else {
                navigate(-1);
              }
            }}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {selectedType && (
            <div className="glass-premium p-8 rounded-2xl">
              <motion.h1
                className="text-4xl font-bold mb-2 text-glow"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {getAccountTypeTitle()}
              </motion.h1>
              <motion.p
                className="text-muted-foreground mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Create your account to get started
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-6"
              >
                <SocialLoginButtons />
              </motion.div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {selectedType === 'general' && <GeneralUserForm onSuccess={handleSuccess} />}
              {selectedType === 'service_provider' && <ServiceProviderForm onSuccess={handleSuccess} />}
              {selectedType === 'client' && <ClientForm onSuccess={handleSuccess} />}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
