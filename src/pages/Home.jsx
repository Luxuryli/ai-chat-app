import TextProcessor from "../components/TextProcessor";
import Header from "../components/Header";

const Home = () => {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
      <Header />
      <TextProcessor />
    </div>
  );
};

export default Home;