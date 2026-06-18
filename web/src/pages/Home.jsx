import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useRequireOnboarding } from '../context/AuthContext';
import * as api from '../api';

export default function Home() {
  const { ready } = useRequireOnboarding();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    api.getHomeOverview()
      .then(setData)
      .catch((err) => setError(err.message));
  }, [ready]);

  if (!ready) return <div className="loading-screen">加载中…</div>;
  if (error) return <div className="empty-tip">{error}</div>;
  if (!data) return <div className="loading-screen">加载中…</div>;

  const { nickName, confinement, deliveryLabel, tips, timeline } = data;

  return (
    <>
      <PageHeader
        title={`你好，${nickName} 👋`}
        subtitle={`月子第 ${confinement.day} 天 · 欢迎回来`}
      />

      <div className="hero-card">
        <span className="hero-label">月子进度</span>
        <div className="hero-day-row">
          <span className="day-num">{confinement.day}</span>
          <span className="day-total">/ {confinement.total} 天</span>
        </div>
        <span className="stage-tag">{confinement.stage?.name}</span>
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${confinement.progress}%` }} />
          </div>
          <span className="progress-text">{confinement.progress}%</span>
        </div>
        <button type="button" className="hero-entry" onClick={() => navigate('/daily-guide')}>
          <div className="hero-entry-left">
            <span className="hero-entry-icon">📋</span>
            <div>
              <span className="hero-entry-title">{deliveryLabel} · 阶段注意事项</span>
              <span className="hero-entry-sub">6 个阶段，自动匹配当前进度</span>
            </div>
          </div>
          <span className="hero-entry-arrow">›</span>
        </button>
        {confinement.isEnded && (
          <div className="ended-tip">月子期已结束，继续记录身体恢复吧</div>
        )}
      </div>

      <div className="card">
        <span className="card-eyebrow">QUICK LOG</span>
        <div className="card-title">记录一下</div>
        <div className="section-hint">选择类型，快速完成记录</div>
        <div className="quick-grid">
          {[
            { type: 'lochia', icon: '💗', label: '恶露' },
            { type: 'pain', icon: '🩹', label: '疼痛' },
            { type: 'mood', icon: '💭', label: '情绪' },
            { type: 'weight', icon: '⚖️', label: '体重' },
            { type: 'breast', icon: '🤱', label: '乳房' },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              className="quick-btn"
              onClick={() => navigate(`/record-add?type=${item.type}`)}
            >
              <span className="quick-icon">{item.icon}</span>
              <span className="quick-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="card-eyebrow">TODAY</span>
        <div className="card-title">今日建议</div>
        {tips.map((tip) => (
          <div key={tip} className="tip-item">
            <span className="tip-dot" />
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">TIMELINE</span>
            <div className="card-title" style={{ marginBottom: 0 }}>今日记录</div>
          </div>
          <button type="button" className="card-link-pill" onClick={() => navigate('/record')}>
            全部 ›
          </button>
        </div>
        {timeline.length === 0 ? (
          <div className="empty-tip">今天还没有记录</div>
        ) : (
          timeline.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-time">{item.time}</div>
              <div className="timeline-bubble">
                <span className="timeline-icon">{item.icon}</span>
                <div>
                  <span className="timeline-title">{item.title}</span>
                  <span className="timeline-detail">{item.detail}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
