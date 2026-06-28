import React, { useState, useRef, useCallback } from "react";

const INITIAL_QUESTIONS = [
  "우리 학교의 전교생 수는 모두 몇 명일까?",
  "우리 학교의 개교기념일은 언제일까?",
  "교가 가사에는 어떤 단어가 가장 많이 나올까?",
  "도서관에서 학생들이 가장 많이 본 책은 무엇일까?",
  "우리는 왜 매일 아침에 학교를 가야 할까?",
  "선생님과 학생이 서로 존중하는 교실은 어떤 모습일까?",
  "학생들이 좋아하는 급식 메뉴에는 어떤 공통점이 있을까?",
  "교실 자리를 어떤 방법으로 바꿔야 할까?",
  "학교 급식 메뉴를 전교생 투표로만 결정해도 될까?",
  "친구와 다투지 않고 지내려면 우리 반에 어떤 규칙이 필요할까?",
  "만약 우리 학교에 운동장이 없다면 어떻게 될까?",
  "우리 학교에는 모두 몇 개의 교실이 있을까?",
  "모두가 행복한 학교란 어떤 학교일까?",
  "다른 학교와 비교했을 때 우리 학교만의 특징은 무엇일까?",
  "수업 시간과 쉬는 시간에 학생들의 모습은 어떻게 다를까?",
  "쉬는 시간이 20분으로 늘어난다면 학교 생활은 어떻게 달라질까?",
  "우리 학교 화단에는 어떤 식물이 있을까?",
  "만약 학교에서 선생님이 사라지면 어떻게 될까?",
];

// 그룹마다 순서대로 돌려쓰는 포인트 색
const GROUP_PALETTE = [
  { base: "#FFB4A2", soft: "#FFEAE4", text: "#9C3B22" }, // 코랄
  { base: "#A8C8E8", soft: "#E9F2FB", text: "#2A5A8A" }, // 소프트블루
  { base: "#B8D8BA", soft: "#EDF6ED", text: "#3D6B40" }, // 세이지
  { base: "#E8C84A", soft: "#FBF3DA", text: "#8A6A12" }, // 머스타드
  { base: "#CBB3E0", soft: "#F2EAF8", text: "#6B4A8C" }, // 라벤더
  { base: "#F0A8C0", soft: "#FCE9F0", text: "#A8456B" }, // 핑크
];

let idCounter = 1000;
const genId = (prefix) => `${prefix}-${idCounter++}-${Math.random().toString(36).slice(2, 7)}`;

export default function QuestionSortTool() {
  const [cards, setCards] = useState(() =>
    INITIAL_QUESTIONS.map((text) => ({ id: genId("card"), text }))
  );
  const [groups, setGroups] = useState(() => [
    { id: genId("group"), name: "" },
    { id: genId("group"), name: "" },
  ]);
  const [sortCriterion, setSortCriterion] = useState("");
  // cardId -> groupId | null(분류 안 됨)
  const [placement, setPlacement] = useState({});
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [newCardText, setNewCardText] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);

  // 드래그 상태
  const [dragCardId, setDragCardId] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoverGroupId, setHoverGroupId] = useState(null); // null=특정대상없음, "TRAY"=카드목록
  const dragCardRef = useRef(null);
  const cardSize = useRef({ w: 0, h: 0 });

  const groupRefs = useRef({});
  const trayRef = useRef(null);

  const getGroupColor = (index) => GROUP_PALETTE[index % GROUP_PALETTE.length];

  const unplacedCards = cards.filter((c) => !placement[c.id]);
  const cardsByGroup = (groupId) => cards.filter((c) => placement[c.id] === groupId);

  // ---------- 드래그 로직 (포인터 이벤트 기반) ----------
  const handlePointerDown = useCallback((e, card) => {
    if (editingCardId) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    cardSize.current = { w: rect.width, h: rect.height };
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragCardId(card.id);
    target.setPointerCapture && e.pointerId != null && target.setPointerCapture(e.pointerId);
  }, [editingCardId]);

  const findDropTarget = useCallback((clientX, clientY) => {
    // 그룹들 먼저 검사
    for (const g of groups) {
      const el = groupRefs.current[g.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return g.id;
      }
    }
    // 카드 트레이(분류 안 된 영역) 검사
    if (trayRef.current) {
      const r = trayRef.current.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return "TRAY";
      }
    }
    return null;
  }, [groups]);

  const handlePointerMove = useCallback((e) => {
    if (!dragCardId) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    const target = findDropTarget(e.clientX, e.clientY);
    setHoverGroupId(target);
  }, [dragCardId, findDropTarget]);

  const handlePointerUp = useCallback((e) => {
    if (!dragCardId) return;
    const target = findDropTarget(e.clientX, e.clientY);
    if (target === "TRAY") {
      setPlacement((prev) => {
        const next = { ...prev };
        delete next[dragCardId];
        return next;
      });
    } else if (target) {
      setPlacement((prev) => ({ ...prev, [dragCardId]: target }));
    }
    setDragCardId(null);
    setHoverGroupId(null);
  }, [dragCardId, findDropTarget]);

  // 전역 포인터 이벤트 등록 (드래그 중일 때만)
  React.useEffect(() => {
    if (!dragCardId) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragCardId, handlePointerMove, handlePointerUp]);

  // ---------- 카드 CRUD ----------
  const addCard = () => {
    let text = newCardText.trim();
    if (!text) return;
    if (!/[?？]$/.test(text)) text += "?";
    setCards((prev) => [...prev, { id: genId("card"), text }]);
    setNewCardText("");
    setShowAddCard(false);
  };

  const deleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setPlacement((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const startEdit = (card) => {
    setEditingCardId(card.id);
    setEditingText(card.text);
  };

  const commitEdit = () => {
    let text = editingText.trim();
    if (text) {
      if (!/[?？]$/.test(text)) text += "?";
      setCards((prev) =>
        prev.map((c) => (c.id === editingCardId ? { ...c, text } : c))
      );
    }
    setEditingCardId(null);
    setEditingText("");
  };

  // ---------- 그룹 CRUD ----------
  const addGroup = () => {
    setGroups((prev) => [...prev, { id: genId("group"), name: "" }]);
  };

  const removeGroup = (groupId) => {
    const hasCards = cards.some((c) => placement[c.id] === groupId);
    if (hasCards) {
      alert("그룹에 카드가 들어 있어요! 먼저 카드를 다른 그룹이나 카드 목록으로 옮겨주세요.");
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const renameGroup = (groupId, name) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, name } : g)));
  };

  const draggedCard = dragCardId ? cards.find((c) => c.id === dragCardId) : null;

  return (
    <div style={styles.app}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .qs-card-base {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .qs-icon-btn {
          background: none; border: none; cursor: pointer; font-size: 15px;
          padding: 2px 4px; border-radius: 6px; opacity: 0.55; transition: opacity 0.15s, background 0.15s;
          line-height: 1;
        }
        .qs-icon-btn:hover { opacity: 1; background: rgba(0,0,0,0.06); }
        input:focus, textarea:focus { outline: 2px solid #A8C8E8; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid #A8C8E8; outline-offset: 2px; }
      `}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>질문 카드 분류하기</h1>
          <p style={styles.subtitle}>나만의 기준으로 질문 카드를 자유롭게 묶어보세요</p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.primaryBtn} onClick={() => setShowAddCard((v) => !v)}>
            + 카드 추가
          </button>
          <button style={styles.secondaryBtn} onClick={addGroup}>
            + 그룹 추가
          </button>
        </div>
      </header>

      {showAddCard && (
        <div style={styles.addCardBar}>
          <input
            style={styles.addCardInput}
            placeholder="새로운 질문을 입력하세요"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCard();
              if (e.key === "Escape") setShowAddCard(false);
            }}
            autoFocus
          />
          <button style={styles.primaryBtn} onClick={addCard}>추가</button>
          <button style={styles.ghostBtn} onClick={() => { setShowAddCard(false); setNewCardText(""); }}>
            취소
          </button>
        </div>
      )}

      {/* 분류되지 않은 카드 트레이 */}
      <section
        ref={trayRef}
        style={{
          ...styles.tray,
          ...(hoverGroupId === "TRAY" ? styles.trayHover : {}),
        }}
      >
        <div style={styles.trayLabel}>
          📋 아직 분류하지 않은 카드 <span style={styles.trayCount}>{unplacedCards.length}</span>
        </div>
        <div style={styles.trayCards}>
          {unplacedCards.length === 0 && (
            <div style={styles.trayEmpty}>모든 카드를 분류했어요! 🎉</div>
          )}
          {unplacedCards.map((card) => (
            <QuestionCard
              key={card.id}
              card={card}
              isDragging={dragCardId === card.id}
              isEditing={editingCardId === card.id}
              editingText={editingText}
              setEditingText={setEditingText}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onEditStart={() => startEdit(card)}
              onEditCommit={commitEdit}
              onDelete={() => deleteCard(card.id)}
              colorScheme={null}
              variant="tray"
            />
          ))}
        </div>
      </section>

      {/* 전체 분류 기준 */}
      <section style={styles.criterionBar}>
        <span style={styles.criterionBarLabel}>🔍 분류 기준</span>
        <input
          style={styles.criterionBarInput}
          placeholder="질문 분류 기준을 적어주세요"
          value={sortCriterion}
          onChange={(e) => setSortCriterion(e.target.value)}
          maxLength={80}
        />
      </section>

      {/* 분류 그룹들 */}
      <section style={styles.groupGrid}>
        {groups.map((group, idx) => {
          const color = getGroupColor(idx);
          const groupCards = cardsByGroup(group.id);
          const isHover = hoverGroupId === group.id;
          return (
            <div
              key={group.id}
              ref={(el) => (groupRefs.current[group.id] = el)}
              style={{
                ...styles.groupBox,
                borderColor: isHover ? color.base : "#E3D9C8",
                background: isHover ? color.soft : "#FFFFFF",
                boxShadow: isHover
                  ? `0 0 0 3px ${color.base}55, 0 10px 24px -8px rgba(0,0,0,0.12)`
                  : "0 4px 14px -6px rgba(0,0,0,0.08)",
              }}
            >
              <div style={styles.groupHeader}>
                <span style={{ ...styles.groupDot, background: color.base }} />
                <input
                  style={{ ...styles.groupNameInput, color: color.text }}
                  placeholder="그룹 이름을 적어주세요"
                  value={group.name}
                  onChange={(e) => renameGroup(group.id, e.target.value)}
                  maxLength={40}
                />
                <button
                  className="qs-icon-btn"
                  title="그룹 삭제"
                  onClick={() => removeGroup(group.id)}
                  aria-label="그룹 삭제"
                >
                  🗑️
                </button>
              </div>
              <div style={styles.groupBody}>
                {groupCards.length === 0 && (
                  <div style={styles.groupEmpty}>여기로 카드를 끌어다 놓아보세요</div>
                )}
                {groupCards.map((card) => (
                  <QuestionCard
                    key={card.id}
                    card={card}
                    isDragging={dragCardId === card.id}
                    isEditing={editingCardId === card.id}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    onPointerDown={(e) => handlePointerDown(e, card)}
                    onEditStart={() => startEdit(card)}
                    onEditCommit={commitEdit}
                    onDelete={() => deleteCard(card.id)}
                    colorScheme={color}
                    variant="group"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* 드래그 중인 카드 (커서를 따라다니는 사본) */}
      {draggedCard && (
        <div
          style={{
            position: "fixed",
            left: dragPos.x - dragOffset.x,
            top: dragPos.y - dragOffset.y,
            width: cardSize.current.w || 178,
            zIndex: 999,
            pointerEvents: "none",
            transform: "rotate(-3deg) scale(1.06)",
            transition: "transform 0.08s ease",
          }}
        >
          <div style={{ ...styles.card, ...styles.cardDraggingGhost }}>
            {draggedCard.text}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  card,
  isDragging,
  isEditing,
  editingText,
  setEditingText,
  onPointerDown,
  onEditStart,
  onEditCommit,
  onDelete,
  colorScheme,
  variant,
}) {
  if (isEditing) {
    return (
      <div
        style={{
          ...styles.card,
          ...styles.cardEditing,
          ...(variant === "tray" || variant === "group" ? { width: "100%" } : {}),
        }}
      >
        <textarea
          style={styles.cardEditTextarea}
          value={editingText}
          autoFocus
          rows={2}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onEditCommit();
            }
            if (e.key === "Escape") onEditCommit();
          }}
          onBlur={onEditCommit}
        />
      </div>
    );
  }

  const baseBorder = variant === "group" && colorScheme ? colorScheme.base : "#E3D9C8";

  return (
    <div
      className="qs-card-base"
      onPointerDown={onPointerDown}
      style={{
        ...styles.card,
        ...(variant === "tray" || variant === "group" ? { width: "100%" } : {}),
        borderColor: baseBorder + "55",
        opacity: isDragging ? 0.25 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <span style={styles.cardText}>{card.text}</span>
      <div style={styles.cardActions}>
        <button
          className="qs-icon-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEditStart(); }}
          aria-label="수정"
          title="수정"
        >
          ✏️
        </button>
        <button
          className="qs-icon-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="삭제"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: "#FBF7F0",
    fontFamily:
      "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#3D3A35",
    padding: "20px 16px 40px",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    maxWidth: 1180,
    margin: "0 auto 18px",
  },
  title: {
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#8A8478",
  },
  headerButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "#FFB4A2",
    color: "#7A2E1B",
    border: "none",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 10px -4px rgba(255,180,162,0.7)",
  },
  secondaryBtn: {
    background: "#FFFFFF",
    color: "#3D3A35",
    border: "2px solid #E3D9C8",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "#8A8478",
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  addCardBar: {
    maxWidth: 1180,
    margin: "0 auto 18px",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    background: "#FFFFFF",
    border: "2px solid #E3D9C8",
    borderRadius: 16,
    padding: 10,
  },
  addCardInput: {
    flex: "1 1 220px",
    border: "2px solid #E3D9C8",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
  },
  tray: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    background: "#FFFFFF",
    border: "3px dashed #E3D9C8",
    borderRadius: 20,
    padding: "14px 16px 16px",
    transition: "background 0.15s, border-color 0.15s",
  },
  trayHover: {
    background: "#F3EFE4",
    borderColor: "#C9BFA8",
  },
  trayLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#8A8478",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  trayCount: {
    background: "#F0EAD9",
    color: "#8A6A12",
    borderRadius: 999,
    fontSize: 12,
    padding: "1px 9px",
    fontWeight: 800,
  },
  trayCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
    paddingBottom: 2,
  },
  trayEmpty: {
    color: "#B4AC9C",
    fontSize: 14,
    padding: "24px 8px",
    fontWeight: 600,
  },
  groupGrid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  groupBox: {
    border: "3px solid #E3D9C8",
    borderRadius: 20,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    minHeight: 180,
    transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
  },
  criterionBar: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    background: "#FFF7EC",
    border: "3px solid #F0DDB0",
    borderRadius: 18,
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  criterionBarLabel: {
    fontSize: 14,
    fontWeight: 800,
    color: "#8A6A12",
    flexShrink: 0,
  },
  criterionBarInput: {
    flex: "1 1 240px",
    border: "none",
    borderBottom: "2px dashed #E3C77A",
    background: "transparent",
    fontSize: 15,
    fontWeight: 600,
    color: "#5A4A26",
    padding: "4px 4px 6px",
    minWidth: 0,
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  groupDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    flexShrink: 0,
  },
  groupNameInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: 16,
    fontWeight: 800,
    padding: "4px 2px",
    minWidth: 0,
  },
  groupBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  groupEmpty: {
    color: "#C9BFA8",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    margin: "auto 0",
    padding: "20px 8px",
  },
  card: {
    background: "#FFFFFF",
    border: "2px solid #E3D9C8",
    borderRadius: 14,
    padding: "10px 10px 10px 14px",
    fontSize: 13.5,
    lineHeight: 1.45,
    boxShadow: "0 2px 6px -2px rgba(0,0,0,0.10)",
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    flexShrink: 0,
    width: 178,
    transition: "opacity 0.1s, box-shadow 0.15s, transform 0.1s",
  },
  cardText: {
    flex: 1,
    wordBreak: "keep-all",
  },
  cardActions: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flexShrink: 0,
  },
  cardDraggingGhost: {
    boxShadow: "0 16px 30px -10px rgba(0,0,0,0.30)",
    border: "2px solid #FFB4A2",
  },
  cardEditing: {
    width: 178,
    flexShrink: 0,
    padding: 8,
  },
  cardEditTextarea: {
    width: "100%",
    border: "2px solid #A8C8E8",
    borderRadius: 10,
    padding: 8,
    fontSize: 13.5,
    fontFamily: "inherit",
    resize: "none",
    lineHeight: 1.4,
  },
};
