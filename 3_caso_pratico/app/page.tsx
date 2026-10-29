"use client";

import { useEffect, useState } from "react";

const countdownDuration = 120;

const questions: Question[] = [
  {
    prompt: "O que você faz diante desse aviso inesperado?",
    options: [
      {
        label: "Clico em “BAIXAR AGORA” para remover os vírus.",
        safe: false,
      },
      {
        label: "Não clico em nada e fecho a aba do navegador.",
        safe: true,
        feedback:
          "Isso mesmo. Não interaja com os botões ou links do alerta. Fechar a aba interrompe a mensagem sem seguir as instruções de quem a enviou.",
      },
      {
        label: "Pago o valor para proteger meus arquivos.",
        safe: false,
      },
    ],
  },
  {
    prompt: "O aviso diz que a proteção expira em poucos segundos. O que isso significa?",
    options: [
      {
        label: "É uma pressão para eu agir sem verificar a mensagem.",
        safe: true,
        feedback:
          "Exatamente. A urgência e a contagem regressiva são táticas para provocar medo. O tempo exibido é fictício: você pode parar e pensar.",
      },
      {
        label: "Preciso correr para não perder meus arquivos.",
        safe: false,
      },
      {
        label: "O antivírus confirmou que há uma infecção.",
        safe: false,
      },
    ],
  },
  {
    prompt: "A janela pede seu CPF e os dados do cartão para continuar. Como você responde?",
    options: [
      {
        label: "Informo os dados; a mensagem precisa deles para me identificar.",
        safe: false,
      },
      {
        label: "Não forneço nenhum dado e não faço pagamentos.",
        safe: true,
        feedback:
          "Correto. Nunca informe dados pessoais ou bancários em um alerta inesperado nem pague para remover uma ameaça anunciada por ele.",
      },
    ],
  },
  {
    prompt: "Você fechou a aba. Como verifica se o computador precisa de atenção?",
    options: [
      {
        label: "Abro manualmente, pelo menu do computador, uma ferramenta de segurança já instalada.",
        safe: true,
        feedback:
          "Boa escolha. Abra a ferramenta por um caminho que você já conhece; não use links, downloads ou contatos fornecidos pelo alerta.",
      },
      {
        label: "Reabro o link da mensagem para seguir a verificação.",
        safe: false,
      },
      {
        label: "Baixo o programa indicado na janela.",
        safe: false,
      },
    ],
  },
  {
    prompt: "Você ainda está em dúvida. Onde procura ajuda?",
    options: [
      {
        label: "Respondo à janela ou ligo para o número que ela mostrou.",
        safe: false,
      },
      {
        label: "Procuro o suporte por um canal oficial que já conheço.",
        safe: true,
        feedback:
          "Perfeito. Canais oficiais e conhecidos ajudam você a confirmar a situação sem depender dos contatos oferecidos na mensagem.",
      },
    ],
  },
];

type Stage = "blank" | "alert" | "chat" | "complete";
type Message = { role: "assistant" | "user"; text: string };
type Answer =
  | { label: string; safe: false }
  | { label: string; safe: true; feedback: string };
type Question = { prompt: string; options: Answer[] };

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("blank");
  const [timeLeft, setTimeLeft] = useState(countdownDuration);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [restartMessage, setRestartMessage] = useState("");

  useEffect(() => {
    if (stage !== "blank") return;

    const timeoutId = window.setTimeout(() => {
      setTimeLeft(countdownDuration);
      setStage("alert");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [stage]);

  useEffect(() => {
    if (stage !== "alert" && stage !== "chat") return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((currentTime) => Math.max(currentTime - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [stage]);

  function restartCase(message = "") {
    setTimeLeft(countdownDuration);
    setQuestionIndex(0);
    setMessages([]);
    setRestartMessage(message);
    setStage(message ? "alert" : "blank");
  }

  function failCase(action: string) {
    restartCase(
      `Você clicou em ${action}. O caso foi reiniciado para você tentar novamente sem interagir com os links ou botões do alerta.`,
    );
  }

  function closeAlert() {
    setRestartMessage("");
    setStage("complete");
  }

  function startConversation() {
    setRestartMessage("");
    setQuestionIndex(0);
    setMessages([
      {
        role: "assistant",
        text: "Vamos pensar juntos. O que você faz diante desse aviso inesperado?",
      },
    ]);
    setStage("chat");
  }

  function answerQuestion(optionIndex: number) {
    const question = questions[questionIndex];
    const answer = question?.options[optionIndex];

    if (!question || !answer || !answer.safe) {
      restartCase(
        "Essa escolha poderia colocar seus dados em risco. O caso foi reiniciado para você tentar novamente.",
      );
      return;
    }

    const nextIndex = questionIndex + 1;
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: answer.label },
      { role: "assistant", text: answer.feedback },
    ];

    if (nextIndex === questions.length) {
      setMessages(nextMessages);
      setStage("complete");
      return;
    }

    const nextQuestion = questions[nextIndex];
    if (!nextQuestion) {
      setMessages(nextMessages);
      setStage("complete");
      return;
    }

    nextMessages.push({ role: "assistant", text: nextQuestion.prompt });
    setMessages(nextMessages);
    setQuestionIndex(nextIndex);
  }

  return (
    <main className="computer">
      {stage === "complete" ? (
        <section aria-labelledby="completion-title" className="completion">
          <div aria-hidden="true" className="completion-check">
            ✓
          </div>
          <p className="completion-eyebrow">Missão concluída</p>
          <h1 id="completion-title">Parabéns! Você conseguiu.</h1>
          <p className="completion-copy">
            Você lidou com uma situação de risco de forma prática e segura:
            não seguiu as instruções do alerta, protegeu seus dados e escolheu
            um caminho confiável. Na dúvida, pare, confira e só então aja.
          </p>
          <button
            className="completion-button"
            onClick={() => restartCase()}
            type="button"
          >
            Recomeçar a simulação <span aria-hidden="true">↻</span>
          </button>
        </section>
      ) : (
        <>
          <header aria-label="Janela do navegador simulada" className="browser">
            <div className="browser-tabs">
              <span aria-hidden="true" className="browser-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="browser-tab">
                <span aria-hidden="true" className="tab-globe">
                  <svg
                    fill="none"
                    height="14"
                    viewBox="0 0 16 16"
                    width="14"
                  >
                    <circle cx="8" cy="8" r="6.25" />
                    <path d="M2 8h12M8 1.75c1.7 1.7 2.45 3.78 2.45 6.25S9.7 12.55 8 14.25C6.3 12.55 5.55 10.47 5.55 8S6.3 3.45 8 1.75Z" />
                  </svg>
                </span>
                Nova guia
                <span aria-hidden="true" className="tab-close">
                  ×
                </span>
              </span>
              <span aria-hidden="true" className="new-tab">
                +
              </span>
              <span className="window-controls" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="browser-toolbar">
              <span aria-hidden="true" className="browser-navigation">
                <svg fill="none" height="18" viewBox="0 0 20 20" width="18">
                  <path d="m11.5 4.5-5.5 5.5 5.5 5.5M6.5 10h10" />
                </svg>
                <svg fill="none" height="18" viewBox="0 0 20 20" width="18">
                  <path d="m8.5 4.5 5.5 5.5-5.5 5.5M13.5 10h-10" />
                </svg>
                <svg fill="none" height="18" viewBox="0 0 20 20" width="18">
                  <path d="M16 8a6 6 0 0 0-10.7-2L4 7.5M4 4v3.5h3.5M4 12a6 6 0 0 0 10.7 2L16 12.5M16 16v-3.5h-3.5" />
                </svg>
              </span>
              <div className="address-bar">
                <span aria-hidden="true">
                  <svg fill="none" height="15" viewBox="0 0 16 16" width="15">
                    <circle cx="7" cy="7" r="4.25" />
                    <path d="m10.25 10.25 3 3" />
                  </svg>
                </span>
                <span>{stage === "blank" ? "Pesquisar ou digitar endereço" : "noticia-exemplo.com"}</span>
              </div>
              <span aria-hidden="true" className="browser-menu">
                ⋮
              </span>
            </div>
          </header>

          <section aria-label="Área de trabalho simulada" className="browser-page">
            {stage === "alert" && (
              <>
                <div
                  aria-label="Alerta falso de vírus; não clique nos controles"
                  className="malicious-popup"
                >
                  <div className="popup-titlebar">
                    <span className="popup-app-icon" aria-hidden="true">
                      !
                    </span>
                    <span>Central de segurança</span>
                    <button
                      aria-label="Fechar alerta e concluir a simulação"
                      className="popup-close"
                      onClick={closeAlert}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="popup-content">
                    <div className="popup-heading">
                      <span aria-hidden="true" className="popup-warning">
                        !
                      </span>
                      <div>
                        <strong>VÍRUS DETECTADO!</strong>
                        <span>Seu computador está em risco</span>
                      </div>
                    </div>
                    <p>
                      Foram encontradas <strong>7 ameaças</strong> no seu
                      dispositivo. Aja agora para evitar a perda dos seus
                      arquivos.
                    </p>
                    <div className="countdown">
                      <span>Tempo para agir</span>
                      <strong
                        aria-label={`Contagem regressiva ${formatTime(timeLeft)}`}
                        className={timeLeft <= 15 ? "timer urgent" : "timer"}
                      >
                        {formatTime(timeLeft)}
                      </strong>
                    </div>
                    <p className="popup-link">
                      Verifique agora:{" "}
                      <button
                        onClick={() => failCase("no link suspeito")}
                        type="button"
                      >
                        seguranca-verificar.example
                      </button>
                    </p>
                    <p>
                      Instale <strong>SuperProteção Pro</strong> ou pague{" "}
                      <strong>R$ 89,90</strong> para remover os vírus. Informe
                      seu CPF e os dados do cartão.
                    </p>
                    <div className="popup-actions">
                      <button
                        onClick={() => failCase("em “Baixar agora”")}
                        type="button"
                      >
                        BAIXAR AGORA
                      </button>
                      <button
                        onClick={() => failCase("em “Pagar e remover”")}
                        type="button"
                      >
                        PAGAR E REMOVER
                      </button>
                    </div>
                    <p className="popup-disclaimer">
                      Simulação educativa: fechar no × é seguro. Os demais
                      controles reiniciam o caso.
                    </p>
                  </div>
                </div>

                <aside aria-labelledby="welcome-title" className="coach-card">
                  <div className="coach-label">
                    <span aria-hidden="true">●</span> ORIENTAÇÃO DE SEGURANÇA
                  </div>
                  <h1 id="welcome-title">Você recebeu um alerta!</h1>
                  <p>
                    Esta janela é uma simulação de golpe. Ela tenta assustar
                    você para que clique, pague ou informe seus dados.
                  </p>
                  {restartMessage && (
                    <div className="restart-message" role="status">
                      <strong>Esse não é o caminho correto!</strong>
                      <span>{restartMessage}</span>
                    </div>
                  )}
                  <div className="coach-tip">
                    <strong>O que fazer agora</strong>
                    <span>
                      Não clique nos botões, não abra o link e não informe seus
                      dados. Observe a mensagem e responda às perguntas para
                      praticar como agir.
                    </span>
                  </div>
                  <button
                    className="coach-button"
                    onClick={startConversation}
                    type="button"
                  >
                    Entendi, vamos começar <span aria-hidden="true">→</span>
                  </button>
                  <span className="simulation-note">
                    Nada será instalado ou enviado.
                  </span>
                </aside>
              </>
            )}

            {stage === "chat" && (
              <>
                <div
                  aria-label="Alerta falso de vírus; não clique nos controles"
                  className="malicious-popup chat-popup"
                >
                  <div className="popup-titlebar">
                    <span className="popup-app-icon" aria-hidden="true">
                      !
                    </span>
                    <span>Central de segurança</span>
                    <button
                      aria-label="Fechar alerta e concluir a simulação"
                      className="popup-close"
                      onClick={closeAlert}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="popup-content">
                    <div className="popup-heading">
                      <span aria-hidden="true" className="popup-warning">
                        !
                      </span>
                      <div>
                        <strong>VÍRUS DETECTADO!</strong>
                        <span>Seu computador está em risco</span>
                      </div>
                    </div>
                    <p>
                      Foram encontradas <strong>7 ameaças</strong>. Aja agora
                      para evitar a perda dos seus arquivos.
                    </p>
                    <div className="countdown">
                      <span>Tempo para agir</span>
                      <strong
                        aria-label={`Contagem regressiva ${formatTime(timeLeft)}`}
                        className={timeLeft <= 15 ? "timer urgent" : "timer"}
                      >
                        {formatTime(timeLeft)}
                      </strong>
                    </div>
                    <p>
                      Instale <strong>SuperProteção Pro</strong> ou pague{" "}
                      <strong>R$ 89,90</strong>. Informe seu CPF e os dados do
                      cartão.
                    </p>
                    <div className="popup-actions">
                      <button
                        onClick={() => failCase("em “Baixar agora”")}
                        type="button"
                      >
                        BAIXAR AGORA
                      </button>
                      <button
                        onClick={() => failCase("em “Pagar e remover”")}
                        type="button"
                      >
                        PAGAR E REMOVER
                      </button>
                    </div>
                    <p className="popup-disclaimer">
                      Simulação: fechar no × é seguro. Os demais controles
                      reiniciam o caso.
                    </p>
                  </div>
                </div>

                <section aria-label="Conversa interativa" className="chat-card">
                  <div className="chat-header">
                    <span aria-hidden="true" className="chat-avatar">
                      ✓
                    </span>
                    <span>
                      <strong>Guia de segurança</strong>
                      <small>
                        Pergunta {questionIndex + 1} de {questions.length}
                      </small>
                    </span>
                    <span aria-hidden="true" className="chat-progress-icon">
                      {questionIndex + 1}
                    </span>
                  </div>
                  <div
                    aria-label={`Progresso: pergunta ${questionIndex + 1} de ${questions.length}`}
                    className="chat-progress-track"
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={questions.length}
                    aria-valuenow={questionIndex + 1}
                  >
                    <span
                      style={{
                        width: `${((questionIndex + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div aria-live="polite" className="chat-messages">
                    {messages.map((message, index) => (
                      <p
                        className={`chat-bubble ${message.role}${index === messages.length - 1 && message.role === "assistant" ? " current-prompt" : ""}`}
                        data-question={
                          index === messages.length - 1 &&
                          message.role === "assistant"
                            ? questionIndex + 1
                            : undefined
                        }
                        key={`${index}-${message.text}`}
                      >
                        {message.text}
                      </p>
                    ))}
                  </div>
                  <div className="chat-answers">
                    <div className="answer-heading">
                      <span aria-hidden="true" className="answer-heading-icon">
                        ?
                      </span>
                      <span>
                        <strong>O que você faria?</strong>
                        <small>Escolha uma resposta para continuar</small>
                      </span>
                    </div>
                    {questions[questionIndex].options.map((option, index) => (
                      <button
                        className="answer-button"
                        key={option.label}
                        onClick={() => answerQuestion(index)}
                        type="button"
                      >
                        <span className="answer-number">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option.label}
                        <span aria-hidden="true" className="answer-arrow">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="chat-foot">
                    Respostas incorretas reiniciam a missão. Não clique nos
                    controles do alerta.
                  </div>
                </section>
              </>
            )}

            {stage === "blank" && restartMessage && (
              <p aria-live="polite" className="loading-message">
                Preparando a simulação novamente…
              </p>
            )}
          </section>

          <footer className="browser-status">
            <span>
              <i aria-hidden="true" /> Navegador simulado
            </span>
            <span>
              {stage === "blank"
                ? "Nova guia"
                : stage === "alert"
                  ? "Alerta recebido"
                  : `Etapa ${questionIndex + 1} de ${questions.length}`}
            </span>
          </footer>
        </>
      )}
    </main>
  );
}
