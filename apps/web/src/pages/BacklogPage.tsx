import { useParams } from 'react-router-dom';
import { BacklogAnalysisPage } from '../components/backlog/BacklogAnalysisPage';

export function BacklogPage() {
  const { projectCode } = useParams<{ projectCode: string }>();

  return <BacklogAnalysisPage projectCode={projectCode} />;
}