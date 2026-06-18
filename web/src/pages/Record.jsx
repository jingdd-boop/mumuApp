import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useRequireOnboarding } from '../context/AuthContext';
import { todayStr } from '../utils/confinement';
import { RECORD_TYPES } from '../utils/record';
import * as api from '../api';

export default function Record() {
  const { ready } = useRequireOnboarding();
  const navigate = useNavigate();
  const [viewTab, setViewTab] = useState('record');
  const [today, setToday] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [chartDays, setChartDays] = useState([]);
  const [detailDays, setDetailDays] = useState([]);
  const [hasTrendData, setHasTrendData] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    const t = todayStr();
    setToday(t);
    return Promise.all([api.getMomRecordsToday(), api.getMomStats()])
      .then(([todayData, stats]) => {
        setRecords(todayData.list || []);
        setChartDays(stats.chartDays || []);
        setDetailDays(stats.detailDays || []);
        setHasTrendData(stats.hasAnyData);
        setTotalDays(stats.totalDays);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!ready) return;
    loadData();
  }, [ready, loadData]);

  const pageSubtitle =
    viewTab === 'record' ? `今日 · ${today}` : `共 ${totalDays} 天 · 左右滑动查看`;

  const onDelete = (id) => {
    if (!window.confirm('确定删除这条记录吗？')) return;
    api.deleteMomRecord(id).then(() => loadData()).catch((err) => alert(err.message));
  };

  if (!ready) return <div className="loading-screen">加载中…</div>;

  return (
    <>
      <PageHeader title="记录" subtitle={pageSubtitle} />

      <div className="tabs">
        <button
          type="button"
          className={`tab${viewTab === 'record' ? ' active' : ''}`}
          onClick={() => setViewTab('record')}
        >
          今日记录
        </button>
        <button
          type="button"
          className={`tab${viewTab === 'trend' ? ' active' : ''}`}
          onClick={() => setViewTab('trend')}
        >
          数据趋势
        </button>
      </div>

      {error && <div className="empty-tip">{error}</div>}

      {viewTab === 'record' && (
        <>
          <div className="card">
            <div className="card-title">添加记录</div>
            <div className="add-grid">
              {RECORD_TYPES.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className="add-chip"
                  onClick={() => navigate(`/record-add?type=${item.type}`)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ marginBottom: 0 }}>
                今日记录
                {records.length > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>
                    {records.length} 条
                  </span>
                )}
              </div>
            </div>
            {records.length === 0 ? (
              <div className="empty-tip">今天还没有记录</div>
            ) : (
              records.map((item) => (
                <div key={item.id} className="record-item">
                  <div className="record-main">
                    <span className="record-icon">{item.icon}</span>
                    <div>
                      <span className="record-title">{item.title} · {item.time}</span>
                      <span className="record-detail">{item.detail}</span>
                    </div>
                  </div>
                  <button type="button" className="record-delete" onClick={() => onDelete(item.id)}>
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {viewTab === 'trend' && (
        <div className="card">
          <div className="card-title">身体恢复趋势</div>
          <div className="section-hint">左右滑动查看各天数据</div>

          {!hasTrendData ? (
            <div className="empty-tip">还没有记录，切换到「今日记录」添加吧</div>
          ) : (
            <>
              <div className="chart-scroll">
                <div className="chart-cols">
                  {chartDays.map((item) => (
                    <div key={item.date} className="chart-col">
                      <div className="chart-col-bars">
                        <div className="chart-bar-wrap">
                          <div className="chart-bar bar-lochia" style={{ height: `${item.lochiaBar}%` }} />
                        </div>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar bar-pain" style={{ height: `${item.painBar}%` }} />
                        </div>
                        <div className="chart-bar-wrap">
                          <span className="chart-mood-emoji">{item.moodEmoji}</span>
                        </div>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar bar-weight" style={{ height: `${item.weightBar}%` }} />
                        </div>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar bar-breast" style={{ height: `${item.breastBar}%` }} />
                        </div>
                      </div>
                      <span className="chart-day-num">第{item.dayIndex}天</span>
                      <span className="chart-day-date">{item.dateShort}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-dot bar-lochia" />恶露</span>
                <span className="legend-item"><span className="legend-dot bar-pain" />疼痛</span>
                <span className="legend-item">💭 情绪</span>
                <span className="legend-item"><span className="legend-dot bar-weight" />体重</span>
                <span className="legend-item"><span className="legend-dot bar-breast" />乳房</span>
              </div>

              <div style={{ marginTop: 24 }}>
                <span className="card-eyebrow">DAILY DETAIL</span>
                {detailDays.map((item) => (
                  <div key={item.date} className="daily-card">
                    <div className="daily-card-head">
                      <span className="daily-day">{item.dayLabel}</span>
                      <span className="daily-date">{item.dateShort}</span>
                    </div>
                    {item.metrics.map((metric) => (
                      <div key={metric.label} className="metric-row">
                        <span className="metric-icon">
                          {metric.isMood ? metric.emoji : metric.icon}
                        </span>
                        <div className="metric-body">
                          <div className="metric-top">
                            <span>{metric.label}</span>
                            <span>{metric.value}</span>
                          </div>
                          {!metric.isMood && metric.barPercent > 0 && (
                            <div className="metric-bar-bg">
                              <div
                                className="metric-bar-fill"
                                style={{ width: `${metric.barPercent}%`, background: metric.color }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
