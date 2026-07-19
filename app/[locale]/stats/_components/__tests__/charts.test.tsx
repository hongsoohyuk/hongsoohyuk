import {render, screen} from '@testing-library/react';
import {LineChart} from '../line-chart';
import {PageDayHeatmap} from '../page-day-heatmap';
import {Sparkline} from '../sparkline';

describe('Sparkline', () => {
  it('유효값 2개 미만이면 아무것도 렌더하지 않는다', () => {
    const {container} = render(<Sparkline points={[1800, null, null]} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('polyline을 렌더한다 (null은 건너뜀)', () => {
    const {container} = render(<Sparkline points={[1800, null, 2100]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).not.toBeNull();
    expect(polyline!.getAttribute('points')!.split(' ')).toHaveLength(2);
  });
});

describe('LineChart', () => {
  const series = [
    {
      label: 'direct',
      points: [
        {day: '2026-07-18', value: 3},
        {day: '2026-07-19', value: 5},
      ],
    },
    {
      label: 'google',
      points: [
        {day: '2026-07-18', value: 1},
        {day: '2026-07-19', value: 0},
      ],
    },
  ];

  it('시리즈 수만큼 polyline과 범례 라벨을 렌더하고 svg에 접근 가능한 이름을 붙인다', () => {
    const {container} = render(<LineChart series={series} label="유입 소스 추이" emptyLabel="없음" />);
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
    expect(screen.getByRole('img', {name: '유입 소스 추이'})).toBeInTheDocument();
    expect(screen.getByText('direct')).toBeInTheDocument();
    expect(screen.getByText('google')).toBeInTheDocument();
  });

  it('전부 0이면 empty 문구', () => {
    const zero = [{label: 'direct', points: [{day: '2026-07-19', value: 0}]}];
    render(<LineChart series={zero} label="유입 소스 추이" emptyLabel="없음" />);
    expect(screen.getByText('없음')).toBeInTheDocument();
  });
});

describe('PageDayHeatmap', () => {
  const matrix = {
    days: ['2026-07-18', '2026-07-19'],
    rows: [{key: '/blog/1', cells: [3, 0], total: 3}],
  };

  it('행 헤더와 값 셀 title을 렌더한다', () => {
    render(<PageDayHeatmap matrix={matrix} emptyLabel="없음" />);
    expect(screen.getByText('/blog/1')).toBeInTheDocument();
    expect(screen.getByTitle('/blog/1 · 2026-07-18 · 3')).toBeInTheDocument();
  });

  it('rows가 비면 empty 문구', () => {
    render(<PageDayHeatmap matrix={{days: [], rows: []}} emptyLabel="없음" />);
    expect(screen.getByText('없음')).toBeInTheDocument();
  });
});
