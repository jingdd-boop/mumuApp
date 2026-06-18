import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useRequireOnboarding } from '../context/AuthContext';
import * as api from '../api';

export default function Learn() {
  const { ready } = useRequireOnboarding();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [confinementDay, setConfinementDay] = useState(1);
  const [stageName, setStageName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    api.getKnowledgeCategories()
      .then((catData) => {
        setCategories(catData.list || []);
        return api.getKnowledgeRecommended(3);
      })
      .then((recommendedData) => {
        setRecommended(recommendedData.list || []);
        setConfinementDay(recommendedData.confinementDay || 1);
        setStageName(recommendedData.stageName || '');
        return api.getKnowledgeArticles(activeCategory);
      })
      .then((articlesData) => setArticles(articlesData.list || []))
      .catch((err) => setError(err.message));
  }, [ready]);

  const onCategoryChange = (id) => {
    setActiveCategory(id);
    api.getKnowledgeArticles(id)
      .then((data) => setArticles(data.list || []))
      .catch((err) => setError(err.message));
  };

  if (!ready) return <div className="loading-screen">加载中…</div>;

  return (
    <>
      <PageHeader title="知识" subtitle="月子恢复 · 科学养护" />

      {error && <div className="empty-tip">{error}</div>}

      {recommended.length > 0 && (
        <div className="recommend-card">
          <div className="recommend-head">
            <span className="recommend-eyebrow">FOR YOU</span>
            <span className="recommend-title">月子第 {confinementDay} 天 · {stageName}</span>
            <span className="recommend-sub">为你精选的恢复知识</span>
          </div>
          {recommended.map((item) => (
            <button
              key={item.id}
              type="button"
              className="recommend-item"
              onClick={() => navigate(`/learn/${item.id}`)}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <span className="recommend-item-title">{item.title}</span>
                <span className="recommend-item-summary">{item.summary}</span>
              </div>
              <span className="recommend-arrow">›</span>
            </button>
          ))}
        </div>
      )}

      <div className="category-scroll">
        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`category-chip${activeCategory === item.id ? ' active' : ''}`}
              onClick={() => onCategoryChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {articles.map((item) => (
          <button
            key={item.id}
            type="button"
            className="article-card"
            onClick={() => navigate(`/learn/${item.id}`)}
          >
            <span className="article-icon">{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div className="article-meta">
                <span>{item.categoryLabel}</span>
                <span>{item.readMinutes} 分钟阅读</span>
              </div>
              <span className="article-title">{item.title}</span>
              <span className="article-summary">{item.summary}</span>
            </div>
          </button>
        ))}
        {articles.length === 0 && <div className="empty-tip">该分类暂无文章</div>}
      </div>

      <div className="disclaimer-tip">
        以上内容仅供参考，不能替代医疗建议。如有不适请及时就医。
      </div>
    </>
  );
}
