import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import * as api from '../api';

export default function LearnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }
    api.getKnowledgeArticle(id)
      .then(setArticle)
      .catch(() => {
        alert('文章不存在');
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="loading-screen">加载中…</div>;
  if (!article) return null;

  return (
    <>
      <PageHeader
        title={article.title}
        subtitle={article.categoryLabel}
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="card">
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>{article.icon}</span>
          <div>
            <div className="article-meta">
              <span>{article.categoryLabel}</span>
              <span>约 {article.readMinutes} 分钟阅读</span>
            </div>
          </div>
        </div>
        <p className="article-summary" style={{ marginBottom: 16 }}>{article.summary}</p>
        <div className="article-content">
          {(article.paragraphs || []).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>

      <div className="disclaimer-tip">
        以上内容仅供参考，不能替代医疗建议。如有不适请及时就医。
      </div>
    </>
  );
}
