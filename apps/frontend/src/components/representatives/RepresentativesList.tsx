import { useEffect, useState } from 'react';
import RepresentativeCard from './RepresentativeCard';
import { api } from '@/lib/api';
import Loader from '../ui/loader';
import { Representative } from '@monorepo/types';

const RepresentativesList = ({ representatives }) => {
    if (representatives.length === 0) {
        return (
            <div className="honor-card text-center py-8">
                <p className="text-honor-darkGray">По вашему запросу ничего не найдено</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {representatives.map((rep: Representative) => (
                <div key={rep.id}>
                    <RepresentativeCard representative={rep} />
                </div>
            ))}
        </div>
    );
};

export default RepresentativesList;
