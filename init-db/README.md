# DB 초기화

이 폴더의 .sql 파일은 PostgreSQL 컨테이너 최초 실행 시 자동으로 실행됩니다.

## Replit 데이터 가져오기

1. Replit Shell에서 실행:
   ```bash
   pg_dump "postgresql://postgres:password@helium/heliumdb?sslmode=disable" \
     --no-owner --no-acl -Fp -f dostac_backup.sql
   ```

2. 파일 다운로드: Replit 파일 패널에서 `dostac_backup.sql` 우클릭 → Download

3. 다운로드한 파일을 이 폴더에 복사:
   ```bash
   cp ~/Downloads/dostac_backup.sql ./init-db/01_backup.sql
   ```

4. docker compose up 실행 (최초 실행 시 자동 임포트)

## 주의

- init-db 폴더의 SQL은 볼륨이 비어있을 때만 실행됩니다
- 이미 실행한 경우 재실행하려면: `docker compose down -v && docker compose up`
