"use client";

import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import useTheme from "@/hooks/useTheme";

export default function OrderStatus({ status }: { status: string }) {
  const theme = useTheme();
  const isDark = theme === "dark";

  const steps = [
    {
      key: "PAID",
      label: "Pago Confirmado",
      icon: CheckCircleIconSolid,
      color: "text-green-500",
    },
    {
      key: "PRODUCTION",
      label: "En Producción",
      icon: ClockIcon,
      color: "text-yellow-500",
    },
    {
      key: "SHIPPED",
      label: "Enviado",
      icon: TruckIcon,
      color: "text-blue-500",
    },
    {
      key: "DELIVERED",
      label: "Entregado",
      icon: HomeIcon,
      color: "text-green-600",
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--primary)] to-green-500"
          initial={{ width: "0%" }}
          animate={{
            width:
              currentStepIndex >= 0
                ? `${((currentStepIndex + 1) / steps.length) * 100}%`
                : "0%",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = step.key === status;
          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center relative z-10"
            >
              {/* Icon */}
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? `bg-[var(--primary)] border-[var(--primary)] text-white`
                    : isCurrent
                    ? `bg-white dark:bg-gray-800 border-[var(--primary)] ${step.color}`
                    : `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500`
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-6 h-6" />
              </motion.div>

              {/* Label */}
              <motion.div
                className={`mt-3 text-center ${
                  isCompleted || isCurrent
                    ? isDark
                      ? "text-white"
                      : "text-gray-900"
                    : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.3 }}
              >
                <p
                  className={`text-sm font-medium ${
                    isCurrent ? "font-bold" : ""
                  }`}
                >
                  {step.label}
                </p>
              </motion.div>

              {/* Current step indicator */}
              {isCurrent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-full h-full bg-[var(--primary)] rounded-full opacity-75"
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`mt-8 p-4 rounded-xl ${
          isDark
            ? "bg-gray-700 border border-gray-600"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          {steps[currentStepIndex] &&
            (() => {
              const IconComponent = steps[currentStepIndex].icon;
              return (
                <>
                  <IconComponent
                    className={`w-6 h-6 ${steps[currentStepIndex].color}`}
                  />
                  <div>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {steps[currentStepIndex].label}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {currentStepIndex === 0 &&
                        "Tu pago ha sido procesado exitosamente"}
                      {currentStepIndex === 1 &&
                        "Estamos trabajando en tu pedido"}
                      {currentStepIndex === 2 && "Tu pedido está en camino"}
                      {currentStepIndex === 3 && "Tu pedido ha sido entregado"}
                    </p>
                  </div>
                </>
              );
            })()}
        </div>
      </motion.div>
    </div>
  );
}
