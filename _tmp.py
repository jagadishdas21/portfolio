import pathlib 
lines=pathlib.Path('styles.css').read_text(encoding='utf-8').splitlines() 
for i in range(960,1045): 
    print(f'{i}:{lines[i-1]}')
