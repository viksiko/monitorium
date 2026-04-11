const DataLoadingError = ({ message }: { message: string }) => {
    return (
        <div className="honor-container py-12">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Ошибка</h1>
                <p className="text-lg text-honor-darkGray">{message}</p>
            </div>
        </div>
    );
};

export default DataLoadingError;
