import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
};

export default function BrandLogo({
  size = 88,
  showText = true,
}: BrandLogoProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src="/logo/kiddospot_logo_exact.svg"
        alt="Kiddospot logo"
        width={size}
        height={size}
        priority
      />

      {showText && (
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
            Kiddospot
          </h1>
          <p className="mt-1 text-sm text-brand-softInk">
            Little spots, big smiles.
          </p>
        </div>
      )}
    </div>
  );
}