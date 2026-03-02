import React, { useState, useEffect } from 'react'
import flashcardService from '../../services/flashcardService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard'
import toast from 'react-hot-toast'

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        setLoading(true);
        const response = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(response.data);
      } catch (error) {

        toast.error("Failed to load flashcard sets");
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You haven't created any flashcard sets yet. Create your first flashcard set to get started"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map(set => (
          <FlashcardSetCard
            key={set._id}
            flashcardSet={set}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      <PageHeader title="Flashcard Sets" />
      {renderContent()}
    </div>
  )
}

export default FlashcardListPage