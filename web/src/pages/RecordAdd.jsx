import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { todayStr } from '../utils/confinement';
import {
  LOCHIA_COLORS,
  LOCHIA_AMOUNTS,
  MOOD_LEVELS,
  ENGORGEMENT_LEVELS,
  BLOCKED_STATUS,
  FEEDING_STATUS,
  BREAST_SIDES,
  TYPE_TITLES,
  nowTimeStr,
} from '../utils/record';
import * as api from '../api';

export default function RecordAdd() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'lochia';
  const { ensureLogin } = useAuth();

  const [time, setTime] = useState(nowTimeStr());
  const [lochiaColor, setLochiaColor] = useState('red');
  const [lochiaAmount, setLochiaAmount] = useState('medium');
  const [lochiaNote, setLochiaNote] = useState('');
  const [painScore, setPainScore] = useState(3);
  const [painNote, setPainNote] = useState('');
  const [moodLevel, setMoodLevel] = useState(3);
  const [weightKg, setWeightKg] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [breastEngorgement, setBreastEngorgement] = useState('none');
  const [breastBlocked, setBreastBlocked] = useState('no');
  const [breastSide, setBreastSide] = useState('left');
  const [breastFeeding, setBreastFeeding] = useState('good');
  const [breastNote, setBreastNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buildPayload = () => {
    switch (type) {
      case 'lochia':
        return { color: lochiaColor, amount: lochiaAmount, note: lochiaNote };
      case 'pain':
        return { score: painScore, note: painNote };
      case 'mood':
        return { level: moodLevel };
      case 'weight':
        return { kg: Math.round(Number(weightKg) * 10) / 10, note: weightNote };
      case 'breast':
        return {
          engorgement: breastEngorgement,
          blocked: breastBlocked,
          side: breastBlocked === 'yes' ? breastSide : '',
          feeding: breastFeeding,
          note: breastNote,
        };
      default:
        return {};
    }
  };

  const onSubmit = async () => {
    if (type === 'weight') {
      const kg = Number(weightKg);
      if (!weightKg || Number.isNaN(kg) || kg < 30 || kg > 200) {
        alert('请输入 30～200 kg 的体重');
        return;
      }
    }

    setSubmitting(true);
    try {
      await ensureLogin();
      await api.createMomRecord({
        type,
        date: todayStr(),
        time,
        payload: buildPayload(),
      });
      navigate(-1);
    } catch (err) {
      alert(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const TagGroup = ({ options, value, onChange }) => (
    <div className="tag-group">
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`tag${value === item.value ? ' active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title={TYPE_TITLES[type] || '添加记录'}
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="card">
        <div className="form-item">
          <label className="form-label">时间</label>
          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {type === 'lochia' && (
          <>
            <div className="form-item">
              <label className="form-label">颜色</label>
              <TagGroup options={LOCHIA_COLORS} value={lochiaColor} onChange={setLochiaColor} />
            </div>
            <div className="form-item">
              <label className="form-label">量</label>
              <TagGroup options={LOCHIA_AMOUNTS} value={lochiaAmount} onChange={setLochiaAmount} />
            </div>
            <div className="form-item">
              <label className="form-label">备注（选填）</label>
              <input
                className="input"
                placeholder="如有异常请描述"
                value={lochiaNote}
                onChange={(e) => setLochiaNote(e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'pain' && (
          <>
            <div className="form-item">
              <label className="form-label">疼痛评分：{painScore} / 10</label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={painScore}
                onChange={(e) => setPainScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#7B5CF0' }}
              />
            </div>
            <div className="form-item">
              <label className="form-label">备注（选填）</label>
              <input
                className="input"
                placeholder="如：伤口处、腰部"
                value={painNote}
                onChange={(e) => setPainNote(e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'mood' && (
          <div className="form-item">
            <label className="form-label">今日心情</label>
            <div className="mood-grid">
              {MOOD_LEVELS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`mood-item${moodLevel === item.value ? ' active' : ''}`}
                  onClick={() => setMoodLevel(item.value)}
                >
                  <span className="mood-emoji">{item.emoji}</span>
                  <span className="mood-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'weight' && (
          <>
            <div className="form-item">
              <label className="form-label">体重（kg）</label>
              <input
                className="input"
                type="number"
                step="0.1"
                placeholder="如 58.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="form-item">
              <label className="form-label">备注（选填）</label>
              <input
                className="input"
                placeholder="选填"
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'breast' && (
          <>
            <div className="form-item">
              <label className="form-label">涨奶情况</label>
              <TagGroup
                options={ENGORGEMENT_LEVELS}
                value={breastEngorgement}
                onChange={setBreastEngorgement}
              />
            </div>
            <div className="form-item">
              <label className="form-label">堵奶情况</label>
              <TagGroup
                options={BLOCKED_STATUS}
                value={breastBlocked}
                onChange={(v) => {
                  setBreastBlocked(v);
                  if (v === 'no') setBreastSide('');
                  else if (!breastSide) setBreastSide('left');
                }}
              />
            </div>
            {breastBlocked === 'yes' && (
              <div className="form-item">
                <label className="form-label">堵奶侧</label>
                <TagGroup options={BREAST_SIDES} value={breastSide} onChange={setBreastSide} />
              </div>
            )}
            <div className="form-item">
              <label className="form-label">哺乳情况</label>
              <TagGroup options={FEEDING_STATUS} value={breastFeeding} onChange={setBreastFeeding} />
            </div>
            <div className="form-item">
              <label className="form-label">备注（选填）</label>
              <input
                className="input"
                placeholder="选填"
                value={breastNote}
                onChange={(e) => setBreastNote(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <button type="button" className="btn-primary" onClick={onSubmit} disabled={submitting}>
        {submitting ? '保存中…' : '保存记录'}
      </button>
    </>
  );
}
