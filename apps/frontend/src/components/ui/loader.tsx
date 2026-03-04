const Loader = () => {
    return (
        <div className="honor-container">
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-honor-blue mx-auto mb-4"></div>
                    <p className="text-honor-darkGray">Загрузка...</p>
                </div>
            </div>
        </div>
    );
};
export default Loader;
