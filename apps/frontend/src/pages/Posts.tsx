import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, Search, Filter, User } from 'lucide-react';
import { useGetTasks } from '@/lib/query/task.query';
import Loader from '@/components/ui/loader';
import { TaskListItem } from '@monorepo/types';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';
import TaskCard from '@/components/task/TaskCard';
import { usePostsFilters } from '@/hooks/usePostsFilters';
import { useShowMore } from '@/hooks/useShowMore';
import PostCard from '@/components/post/PostCard';
import { useGetPosts } from '@/lib/query/post.query';

const Posts = () => {
    const { data: postsData, isLoading, isPending, isError } = useGetPosts();
    const {
        filteredData: filteredPosts,
        districts,
        selectedDistrict,
        searchTerm,
        handleDistrictFilter,
        handleSearch,
        resetFilters,
    } = usePostsFilters(postsData ?? []);

    const { displayedItems, shouldShowButton, showAll, remainingCount, handleShowAll, handleCollapse } = useShowMore(
        filteredPosts,
        { defaultItemsCount: 5 },
    );

    if (isLoading || isPending) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Публикации и статьи</h1>
                        <p className="text-honor-darkGray mb-8">Список всех публикаций представителей власти</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <div className="honor-card mb-6">
                            <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Округ/Район</label>
                                <div className="space-y-2">
                                    {districts.map((district) => (
                                        <button
                                            key={district.id}
                                            onClick={() => handleDistrictFilter(district.id)}
                                            className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm ${
                                                selectedDistrict === district?.id
                                                    ? 'bg-honor-blue text-white'
                                                    : 'hover:bg-honor-gray text-honor-darkGray'
                                            }`}>
                                            <MapPin
                                                size={16}
                                                className="mr-2"
                                            />
                                            {district?.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full honor-button-secondary"
                                onClick={resetFilters}>
                                Сбросить фильтры
                            </Button>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-grow">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                        size={18}
                                    />
                                    <Input
                                        placeholder="Поиск задач..."
                                        className="honor-input pl-10 text-base"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="max-w-5xl mx-auto">
                            <div className="max-w-5xl mx-auto">
                                {filteredPosts.length === 0 ? (
                                    <p className="text-honor-darkGray text-center py-6">
                                        По вашему запросу ничего не найдено
                                    </p>
                                ) : (
                                    <>
                                        {displayedItems.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                            />
                                        ))}

                                        {shouldShowButton && !showAll && (
                                            <div className="text-center mt-6">
                                                <button
                                                    onClick={handleShowAll}
                                                    className="px-6 py-2 text-sm font-medium text-honor-blue border border-honor-blue rounded-lg hover:bg-honor-blue hover:text-white transition-colors">
                                                    Показать все ({remainingCount} осталось)
                                                </button>
                                            </div>
                                        )}

                                        {showAll && shouldShowButton && (
                                            <div className="text-center mt-6">
                                                <button
                                                    onClick={handleCollapse}
                                                    className="px-6 py-2 text-sm font-medium text-honor-darkGray border border-honor-darkGray rounded-lg hover:bg-honor-darkGray hover:text-white transition-colors">
                                                    Свернуть
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Posts;
