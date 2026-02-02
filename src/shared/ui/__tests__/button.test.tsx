import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('텍스트와 함께 렌더링된다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('클릭 이벤트를 처리한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭이 방지된다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>클릭</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('variants', () => {
    it('default variant를 적용한다', () => {
      render(<Button variant="default">버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'default');
    });

    it('destructive variant를 적용한다', () => {
      render(<Button variant="destructive">삭제</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'destructive');
    });

    it('outline variant를 적용한다', () => {
      render(<Button variant="outline">외곽선</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline');
    });

    it('ghost variant를 적용한다', () => {
      render(<Button variant="ghost">고스트</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
    });

    it('link variant를 적용한다', () => {
      render(<Button variant="link">링크</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'link');
    });
  });

  describe('sizes', () => {
    it('default size를 적용한다', () => {
      render(<Button size="default">버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'default');
    });

    it('sm size를 적용한다', () => {
      render(<Button size="sm">작은 버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');
    });

    it('lg size를 적용한다', () => {
      render(<Button size="lg">큰 버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
    });

    it('icon size를 적용한다', () => {
      render(<Button size="icon">아이콘</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon');
    });
  });

  it('커스텀 className을 적용한다', () => {
    render(<Button className="custom-class">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('asChild prop으로 다른 요소로 렌더링한다', () => {
    render(
      <Button asChild>
        <a href="/link">링크 버튼</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: '링크 버튼' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/link');
  });

  it('type 속성을 전달한다', () => {
    render(<Button type="submit">제출</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
