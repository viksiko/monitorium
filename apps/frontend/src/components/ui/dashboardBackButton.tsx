import { Link } from 'react-router-dom';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';

const DashboardBackButton = () => {
    return (
        <div className="absolute top-[-28px]">
            <div className="flex items-center">
                <ChevronLeft
                    size={16}
                    strokeWidth={1.75}
                    className="text-honor-blue"
                />

                <Link
                    to="/dashboard"
                    className="block w-4 hover:opacity-80">
                    <LayoutDashboard
                        size={22}
                        strokeWidth={1.75}
                        className="text-honor-blue"
                    />
                </Link>
            </div>
        </div>
    );
};

export default DashboardBackButton;
