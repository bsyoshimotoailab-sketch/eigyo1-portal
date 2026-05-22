/**
 * analytics.js
 * GA4 測定IDをここ1か所で管理します。
 * 本番公開前に GA_MEASUREMENT_ID を正式IDに差し替えてください。
 * 仮ID（G-XXXXXXXXXX）のままではGA4スクリプトを読み込まず、
 * サイト表示・ボタン動作に一切影響しません。
 *
 * 計測イベント一覧:
 *   booking_click          - イベント出演依頼ボタン (.ncta) クリック
 *   diagnosis_start        - 診断スタートボタン クリック
 *   diagnosis_result_shown - 診断結果画面 表示完了
 *   result_copy            - 結果コピーボタン クリック
 *   youtube_click          - YouTube外部リンク クリック
 *   goods_page_view        - グッズページ 表示
 *   click_goods_link       - Wattsオンラインショップリンク クリック
 */
(function () {
  'use strict';

  // ── 測定ID（本番前にここを差し替える） ──
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  // 正式なGA4 IDかどうか確認（仮IDなら何もしない）
  var IS_REAL_ID = /^G-[A-Z0-9]{7,}$/.test(GA_MEASUREMENT_ID) &&
                  GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

  // ── GA4スクリプト読み込み ──
  if (IS_REAL_ID) {
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  // ── 安全なイベント送信（gtag未定義でもエラーにならない） ──
  function sendEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (e) {}
  }

  // ── クリック計測セットアップ ──
  function setupTracking() {
    // イベント出演依頼ボタン（.ncta）→ booking_click
    document.querySelectorAll('a.ncta').forEach(function (el) {
      el.addEventListener('click', function () {
        sendEvent('booking_click', { link_url: el.href });
      });
    });

    // 診断スタートボタン → diagnosis_start
    var startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        sendEvent('diagnosis_start');
      });
    }

    // 診断結果画面 表示完了 → diagnosis_result_shown
    // diagnosis.html の showResult() がカスタムイベントを dispatch する
    document.addEventListener('diagnosisResultShown', function (e) {
      sendEvent('diagnosis_result_shown', {
        diagnosis_type: (e.detail && e.detail.type) || ''
      });
    });

    // 診断結果コピーボタン → result_copy
    var copyBtn = document.getElementById('btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        sendEvent('result_copy', { diagnosis_type: window._mainType || '' });
      });
    }

    // YouTubeへの外部リンク → youtube_click
    document.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]').forEach(function (el) {
      el.addEventListener('click', function () {
        sendEvent('youtube_click', {
          link_url: el.href,
          link_text: (el.textContent || '').trim().slice(0, 100)
        });
      });
    });

    // Wattsオンラインショップリンク → click_goods_link
    document.querySelectorAll('a[href*="watts-online.jp"]').forEach(function (el) {
      el.addEventListener('click', function () {
        sendEvent('click_goods_link', { link_url: el.href });
      });
    });

    // グッズページビュー → goods_page_view
    // goods.html でのみ発火（pathname に "goods" を含む場合）
    if (/goods/.test(window.location.pathname)) {
      sendEvent('goods_page_view');
    }
  }

  // defer属性で読み込まれるため、DOM解析完了後に実行される
  // readyState が 'loading' の場合は念のため DOMContentLoaded を待つ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTracking);
  } else {
    setupTracking();
  }
})();
