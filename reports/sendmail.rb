
def sendmail(from, to, subject, body)
	s = ""\
		"From: #{from}\\n"\
		"To: #{to}\\n"\
		"MIME-Version: 1.0\\n"\
		"Content-Type: text/html\\n"\
		"Subject: #{subject}\\n"\
		"\\n"\
		"#{body.gsub '"', '\\"'}"

  %x{
		echo "#{s.gsub "\u0000", ''}" | sendmail -t
	}
end


from = ARGV[0]
to = ARGV[1]
subject = ARGV[2]
body = File.read(ARGV[3])

sendmail from, to, subject, body
