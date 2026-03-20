import { useNavigate } from "react-router-dom";

interface AppLogoProps {
  loading: boolean;
  src: string;
  alt: string;
}
const AppLogo: React.FC<AppLogoProps> = ({ loading, src, alt }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-between lg:justify-start align-center items-center mb-4">
      {loading ? (
        <div
          className="w-32 h-32 bg-gray-300 rounded-2xl animate-pulse"
          aria-hidden="true"
        ></div> //Skeleton
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-24 object-contain p-4 bg-[#F5F7FA] rounded-2xl shadow-sm"
        />
      )}

      <button
        className="text-blue-600 mb-4 inline-block lg:hidden cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
    </div>
  );
};

export default AppLogo;
