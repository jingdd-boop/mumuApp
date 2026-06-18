import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function DailyGuide() {
  const navigate = useNavigate();
  const { ensureLogin } = useAuth();
  const [guide, setGuide] = useState(null);
  const [stages, setStages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deliveryLabel, setDeliveryLabel] = useState('');
  const [confinementDay, setConfinementDay] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureLogin()
      .then(() => api.getDeliveryGuide())
      .then((data) => {
        setGuide(data.guide);
        setStages(data.stages || []);
        setCurrentIndex(data.currentIndex || 0);
        setConfinementDay(data.confinementDay || 1);
        setDeliveryLabel(data.deliveryLabel || '');
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, [ensureLogin]);

  const onStageChange = (index) => {
    const stage = stages.find((s) => s.index === index);
    if (!stage) return;
    setGuide({
      ...stage,
      deliveryLabel,
      deliveryType: guide?.deliveryType || 'natural',
    });
    setCurrentIndex(index);
  };

  if (loading) return <div className="loading-screen">加载中…</div>;

  return (
    <>
      <PageHeader
        title="阶段注意事项"
        subtitle={`月子第 ${confinementDay} 天 · ${deliveryLabel}`}
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="stage-tabs">
        {stages.map((stage) => (
          <button
            key={stage.index}
            type="button"
            className={`stage-tab${currentIndex === stage.index ? ' active' : ''}`}
            onClick={() => onStageChange(stage.index)}
          >
            {stage.stageLabel} · {stage.rangeLabel}
          </button>
        ))}
      </div>

      {guide && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <span className="card-eyebrow">{deliveryLabel}专属</span>
            <div className="card-title" style={{ marginBottom: 8 }}>{guide.focus}</div>
            <div className="section-hint">{guide.rangeLabel} · {guide.stageLabel}</div>
          </div>

          <div className="card">
            <div className="guide-heading">✅ 阶段护理</div>
            <ul className="guide-list">
              {(guide.care || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="guide-heading">🚫 阶段避免</div>
            <ul className="guide-list">
              {(guide.avoid || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="guide-heading">⚠️ 需要警惕</div>
            <ul className="guide-list">
              {(guide.watch || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="disclaimer-tip">以上内容仅供参考，不能替代医疗建议。如有不适请及时就医。</div>
        </>
      )}
    </>
  );
}
