-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.update_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_tier TEXT;
BEGIN
  -- Get current XP
  SELECT COALESCE(xp, 0) INTO v_current_xp 
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  v_new_xp := v_current_xp + p_xp_amount;
  
  -- Calculate level (every 1000 XP = 1 level)
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);
  
  -- Calculate tier based on level
  v_new_tier := CASE
    WHEN v_new_level >= 50 THEN 'diamond'
    WHEN v_new_level >= 30 THEN 'gold'
    WHEN v_new_level >= 15 THEN 'silver'
    ELSE 'bronze'
  END;
  
  -- Update profile
  UPDATE public.profiles 
  SET xp = v_new_xp, level = v_new_level, skill_tier = v_new_tier
  WHERE user_id = p_user_id;
END;
$$;

-- INSERT NEW LESSONS

-- Number Row Lessons
INSERT INTO public.lessons (title, description, category, content, keys_focus, order_index, difficulty) VALUES
('Number Row Basics', 'Learn to type numbers 1-5', 'Number Row', '111 222 333 444 555 123 234 345 451 512 121 232 343 454 515 135 246 357 142 253', ARRAY['1', '2', '3', '4', '5'], 50, 1),
('Number Row Extended', 'Learn to type numbers 6-0', 'Number Row', '666 777 888 999 000 678 789 890 906 067 676 787 898 909 060 680 790 860 970 608', ARRAY['6', '7', '8', '9', '0'], 51, 1),
('Full Number Row', 'Practice all numbers 0-9', 'Number Row', '1234567890 0987654321 1928374650 5647382910 1357924680 2468013579 9876543210 1234509876 5678901234 0123456789', ARRAY['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], 52, 2),
('Number Symbols', 'Learn !@#$% symbols', 'Number Row', '!!! @@@ ### $$$ %%% !@# @#$ #$% $%^ %^& !!! @!@ #@# $#$ %$%', ARRAY['!', '@', '#', '$', '%'], 53, 2),
('More Number Symbols', 'Learn ^&*() symbols', 'Number Row', '^^^ &&& *** ((( ))) ^&* &*( *(( ()) ))( ^*& &^* (*& )&* (^)', ARRAY['^', '&', '*', '(', ')'], 54, 2),
('Number Row Mastery', 'Master all number row keys', 'Number Row', '1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) !@#$%^&*() 123!@# 456$%^ 789&*( 0)_ 1!2@3# 4$5%6^ 7&8*9( 0)', ARRAY['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')'], 55, 3);

-- Capital Letters Practice
INSERT INTO public.lessons (title, description, category, content, keys_focus, order_index, difficulty) VALUES
('Capital A-M', 'Practice capital letters A through M', 'Capital Letters', 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm ABC DEF GHI JKL Adam Betty Carl Diana Eric Frank Grace Henry Irene Jack Kelly Liam Mary', ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], 60, 1),
('Capital N-Z', 'Practice capital letters N through Z', 'Capital Letters', 'Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz NOP QRS TUV WXY Nancy Oscar Paul Quinn Rachel Steve Tom Uma Victor Wendy Xavier Yolanda Zack', ARRAY['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], 61, 1),
('Mixed Case Words', 'Practice words with capitals', 'Capital Letters', 'Hello World JavaScript TypeScript React Python HTML CSS Node Express MongoDB PostgreSQL GitHub LinkedIn Twitter Facebook Instagram', ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], 62, 2),
('Proper Nouns', 'Practice names and places', 'Capital Letters', 'New York Los Angeles San Francisco Chicago Boston Seattle Miami Denver Phoenix Portland Austin Dallas Houston Atlanta Detroit Philadelphia', ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], 63, 2),
('Capital Letters Mastery', 'Master shift key combinations', 'Capital Letters', 'The Quick Brown Fox Jumps Over The Lazy Dog. HELLO WORLD! JavaScript Is Amazing. React And TypeScript Work Great Together. Python For Data Science. AWS Cloud Services.', ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], 64, 3);

-- Common Words Practice
INSERT INTO public.lessons (title, description, category, content, keys_focus, order_index, difficulty) VALUES
('Top 25 Words', 'Most common English words', 'Common Words', 'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their', ARRAY['t', 'h', 'e', 'b', 'o', 'a', 'n', 'd', 'i'], 70, 1),
('Top 50 Words', 'Extended common words', 'Common Words', 'what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us', ARRAY['w', 'h', 'a', 't', 's', 'o', 'u', 'p'], 71, 1),
('Business Words', 'Common business vocabulary', 'Common Words', 'meeting project deadline budget report analysis strategy marketing sales revenue profit growth investment client customer service quality management team leadership communication collaboration', ARRAY['m', 'e', 't', 'i', 'n', 'g', 'p', 'r', 'o', 'j', 'c'], 72, 2),
('Technology Words', 'Common tech vocabulary', 'Common Words', 'software hardware network database server cloud storage security algorithm interface application development framework library component function variable object method class instance', ARRAY['s', 'o', 'f', 't', 'w', 'a', 'r', 'e', 'h', 'd'], 73, 2),
('Academic Words', 'Common academic vocabulary', 'Common Words', 'research analysis theory hypothesis experiment data evidence conclusion argument thesis dissertation methodology literature review bibliography citation reference abstract summary introduction', ARRAY['r', 'e', 's', 'a', 'c', 'h', 'n', 'l', 'y', 'i'], 74, 2);

-- Code Typing Lessons
INSERT INTO public.lessons (title, description, category, content, keys_focus, order_index, difficulty) VALUES
('JavaScript Basics', 'Practice JavaScript syntax', 'Code Typing', 'const let var function return if else for while switch case break continue true false null undefined typeof instanceof new this class extends', ARRAY['c', 'o', 'n', 's', 't', 'l', 'e', 'v', 'a', 'r'], 80, 2),
('JavaScript Functions', 'Practice function syntax', 'Code Typing', 'function add(a, b) { return a + b; } const multiply = (x, y) => x * y; async function fetchData() { await fetch(url); } array.map(item => item.id);', ARRAY['f', 'u', 'n', 'c', 't', 'i', 'o', '(', ')', '{', '}'], 81, 2),
('TypeScript Types', 'Practice TypeScript syntax', 'Code Typing', 'interface User { id: number; name: string; email: string; } type Props = { children: React.ReactNode; } const data: string[] = []; function getValue<T>(item: T): T { return item; }', ARRAY['i', 'n', 't', 'e', 'r', 'f', 'a', 'c', ':', '<', '>'], 82, 3),
('React Components', 'Practice React syntax', 'Code Typing', 'import React from "react"; export default function App() { const [state, setState] = useState(0); return <div className="container">{state}</div>; } useEffect(() => {}, []);', ARRAY['i', 'm', 'p', 'o', 'r', 't', 'e', 'x', '<', '>'], 83, 3),
('Python Basics', 'Practice Python syntax', 'Code Typing', 'def main(): print("Hello") for i in range(10): pass if __name__ == "__main__": main() import numpy as np class MyClass: def __init__(self): self.value = 0', ARRAY['d', 'e', 'f', 'p', 'r', 'i', 'n', 't', ':', '_'], 84, 2),
('HTML & CSS', 'Practice HTML and CSS', 'Code Typing', '<div class="container"><h1>Title</h1><p>Content</p></div> .container { display: flex; justify-content: center; align-items: center; padding: 20px; margin: 10px; }', ARRAY['<', '>', '/', '.', ':', ';', '{', '}'], 85, 2),
('SQL Queries', 'Practice SQL syntax', 'Code Typing', 'SELECT * FROM users WHERE id = 1; INSERT INTO posts (title, content) VALUES ("Hello", "World"); UPDATE users SET name = "John" WHERE id = 1; DELETE FROM comments WHERE post_id = 5;', ARRAY['S', 'E', 'L', 'C', 'T', 'F', 'R', 'O', 'M', 'W', 'H'], 86, 2);

-- Finger-Specific Exercises
INSERT INTO public.lessons (title, description, category, content, keys_focus, order_index, difficulty) VALUES
('Left Pinky Training', 'Strengthen your left pinky', 'Finger Training', 'qa qaz qazx aq za xz 1q q1 1qa qa1 `~ ~` 1!` a1` qa1 zaq xza qzax 1qaz `1qa tab shift caps', ARRAY['q', 'a', 'z', '1', '`'], 90, 1),
('Left Ring Training', 'Strengthen your left ring finger', 'Finger Training', 'ws wsx wsxc sw xs cx 2w w2 2ws ws2 wsx sxw xsw swx cxs wsxc 2wsx w2sx sw2x', ARRAY['w', 's', 'x', '2'], 91, 1),
('Left Middle Training', 'Strengthen your left middle finger', 'Finger Training', 'ed edc edcv de cd vc 3e e3 3ed ed3 edc dce cde ecd vcd edcv 3edc e3dc de3c', ARRAY['e', 'd', 'c', '3'], 92, 1),
('Left Index Training', 'Strengthen your left index finger', 'Finger Training', 'rf rfv rfvb rfg rft fr vf bf 4r r4 4rf rf4 5t t5 5tg tg5 rfv vrf bvf fvb gtf rfvb 4rf5 r4t5', ARRAY['r', 'f', 'v', 't', 'g', 'b', '4', '5'], 93, 1),
('Right Index Training', 'Strengthen your right index finger', 'Finger Training', 'uj ujm ujmn ujh ujy ju mj nj 7u u7 7uj uj7 6y y6 6yh yh6 ujm mju nmj jmn hyj ujmn 7uj6 u7y6', ARRAY['u', 'j', 'm', 'y', 'h', 'n', '6', '7'], 94, 1),
('Right Middle Training', 'Strengthen your right middle finger', 'Finger Training', 'ik ik, ik,. ki ,k .k 8i i8 8ik ik8 ik, ,ki .,k k,. <,. ik,. 8ik, i8k, ki8,', ARRAY['i', 'k', ',', '8'], 95, 1),
('Right Ring Training', 'Strengthen your right ring finger', 'Finger Training', 'ol ol. ol./ lo .l /l 9o o9 9ol ol9 ol. .lo /.l l./ >.; ol./ 9ol. o9l. lo9.', ARRAY['o', 'l', '.', '9'], 96, 1),
('Right Pinky Training', 'Strengthen your right pinky', 'Finger Training', 'p; p;/ p;/? ;p /; ?/ 0p p0 0p; p;0 -p p- =p p= [p p[ ]p p] p;/ /;p ?/; ;/? enter backspace', ARRAY['p', ';', '/', '0', '-', '=', '[', ']', '?'], 97, 1),
('Thumb Training', 'Practice spacebar rhythm', 'Finger Training', 'a b c d e f g h i j k l m n o p q r s t u v w x y z 1 2 3 4 5 6 7 8 9 0 the quick brown fox jumps over lazy dog', ARRAY[' '], 98, 1);