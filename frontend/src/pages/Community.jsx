import QuestionList from '../components/Community/QuestionList';
import AskQuestion from '../components/Community/AskQuestion';

const Community = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Farmer Community</h1>
            <AskQuestion />
            <QuestionList />
        </div>
    );
};

export default Community;
