import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EscalateRepresentative } from './index';

interface RepresentativesSearchProps {
    searchTerm: string;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RepresentativesSearch = ({ searchTerm, handleSearch }: RepresentativesSearchProps) => {
    const [showEscalation, setShowEscalation] = useState(false);

    return (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        className="honor-input pl-10 text-base"
                        placeholder="Поиск представителя власти"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                {/* <Dialog
                    open={showEscalation}
                    onOpenChange={setShowEscalation}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 whitespace-nowrap text-base">
                            <AlertTriangle size={16} />
                            Эскалация
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <EscalateRepresentative
                            onCancel={() => setShowEscalation(false)}
                        />
                    </DialogContent>
                </Dialog> */}
            </div>
        </div>
    );
};

export default RepresentativesSearch;
