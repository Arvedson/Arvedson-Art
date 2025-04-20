export default function OrderStatus({ status }: { status: string }) {
    const steps = ['PAID','PRODUCTION','SHIPPED','DELIVERED'];
    return (
      <ul className="flex space-x-4">
        {steps.map(step => (
          <li key={step} className={step === status ? 'font-bold' : ''}>
            {step}
          </li>
        ))}
      </ul>
    );
  }
  