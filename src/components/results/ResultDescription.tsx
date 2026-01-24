interface ResultDescriptionProps {
  description: string;
}

export function ResultDescription({ description }: ResultDescriptionProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <p className="text-gray-700 text-lg leading-relaxed">
        {description}
      </p>
    </div>
  );
}
